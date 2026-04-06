import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';

export type LemonSqueezyWebhookPayload = {
  meta?: {
    event_name?: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data?: {
    id?: string | number;
    attributes?: {
      status?: string;
      ends_at?: string | null;
      renews_at?: string | null;
      customer_id?: number | string;
    };
  };
};

const SUBSCRIPTION_EVENTS = new Set([
  'subscription_created',
  'subscription_updated',
]);

@Injectable()
export class LemonSqueezyService {
  private readonly logger = new Logger(LemonSqueezyService.name);

  constructor(private readonly prisma: PrismaService) {}

  assertValidWebhookSignature(
    rawBody: Buffer | undefined,
    xSignatureHeader: string | string[] | undefined,
  ): asserts rawBody is Buffer {
    const secret = process.env.LEMON_SQUEEZY_SIGNING_SECRET;
    if (!secret) {
      this.logger.error('LEMON_SQUEEZY_SIGNING_SECRET is not set');
      throw new InternalServerErrorException('Webhook signing secret is not configured');
    }

    if (!rawBody?.length) {
      throw new BadRequestException('Missing raw request body');
    }

    const xSignature =
      typeof xSignatureHeader === 'string'
        ? xSignatureHeader
        : xSignatureHeader?.[0];
    if (!xSignature) {
      throw new UnauthorizedException('Missing x-signature header');
    }

    const hmac = createHmac('sha256', secret);
    const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
    const signature = Buffer.from(xSignature, 'utf8');

    if (digest.length !== signature.length || !timingSafeEqual(digest, signature)) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  async handleWebhookPayload(payload: LemonSqueezyWebhookPayload): Promise<void> {
    const eventName = payload.meta?.event_name;
    if (!eventName || !SUBSCRIPTION_EVENTS.has(eventName)) {
      return;
    }

    const userId = payload.meta?.custom_data?.user_id?.trim();
    if (!userId) {
      this.logger.warn(`${eventName}: missing meta.custom_data.user_id`);
      return;
    }

    const subscriptionId = payload.data?.id;
    const lsSubscriptionId =
      subscriptionId === undefined || subscriptionId === null
        ? null
        : String(subscriptionId);

    if (!lsSubscriptionId) {
      this.logger.warn(`${eventName}: missing data.id`);
      return;
    }

    const attrs = payload.data?.attributes;
    const lsStatus = attrs?.status?.trim() || 'active';
    const planStatus = this.mapLsStatus(lsStatus);
    const endsAt = this.parseDate(attrs?.ends_at) ?? this.parseDate(attrs?.renews_at) ?? null;
    const lsCustomerId =
      attrs?.customer_id === undefined || attrs?.customer_id === null
        ? undefined
        : String(attrs.customer_id);

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`${eventName}: no user found for id=${userId}`);
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        planStatus,
        lsSubscriptionId,
        endsAt,
        ...(lsCustomerId !== undefined ? { lsCustomerId } : {}),
      },
    });

    this.logger.log(
      `${eventName}: user ${userId} → planStatus=${planStatus}, endsAt=${endsAt?.toISOString() ?? 'null'}, lsSub=${lsSubscriptionId}, lsCustomer=${lsCustomerId ?? 'unchanged'}`,
    );
  }

  private mapLsStatus(lsStatus: string): string {
    switch (lsStatus) {
      case 'active':
        return 'active';
      case 'on_trial':
        return 'on_trial';
      case 'cancelled':
        return 'cancelled';
      case 'expired':
      case 'past_due':
      case 'unpaid':
        return 'expired';
      default:
        return lsStatus;
    }
  }

  private parseDate(value: string | null | undefined): Date | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  /**
   * Resolves the signed Lemon Squeezy customer portal URL for the authenticated user.
   * Uses `lsCustomerId` from webhooks; if missing, backfills from `lsSubscriptionId` via the LS API.
   */
  async getBillingPortalUrlForUser(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lsCustomerId: true, lsSubscriptionId: true },
    });

    if (!user) {
      throw new NotFoundException({ error: 'No customer found' });
    }

    let customerId = user.lsCustomerId?.trim() || null;
    if (!customerId && user.lsSubscriptionId) {
      customerId = await this.fetchAndPersistCustomerIdFromSubscription(userId, user.lsSubscriptionId);
    }

    if (!customerId) {
      throw new NotFoundException({ error: 'No customer found' });
    }

    const body = await this.lemonSqueezyApiGet(`/customers/${encodeURIComponent(customerId)}`);
    const portalUrl = this.readCustomerPortalUrl(body);
    if (!portalUrl) {
      this.logger.error('Lemon Squeezy customer response missing urls.customer_portal');
      throw new InternalServerErrorException('Billing portal URL is not available');
    }
    return portalUrl;
  }

  private getLemonSqueezyApiKey(): string {
    const key =
      process.env.LEMONSQUEEZY_API_KEY?.trim() || process.env.LEMON_SQUEEZY_API_KEY?.trim();
    if (!key) {
      this.logger.error('LEMONSQUEEZY_API_KEY (or LEMON_SQUEEZY_API_KEY) is not set');
      throw new InternalServerErrorException('Lemon Squeezy API is not configured');
    }
    return key;
  }

  private async lemonSqueezyApiGet(path: string): Promise<unknown> {
    const key = this.getLemonSqueezyApiKey();
    const res = await fetch(`https://api.lemonsqueezy.com/v1${path}`, {
      headers: {
        Authorization: `Bearer ${key}`,
        Accept: 'application/vnd.api+json',
      },
    });
    if (!res.ok) {
      const text = await res.text();
      this.logger.warn(`Lemon Squeezy GET ${path} → ${res.status}: ${text.slice(0, 500)}`);
      throw new BadRequestException('Could not load billing portal');
    }
    return res.json() as Promise<unknown>;
  }

  private readCustomerPortalUrl(body: unknown): string | null {
    const data = body as {
      data?: { attributes?: { urls?: { customer_portal?: string } } };
    };
    const url = data.data?.attributes?.urls?.customer_portal;
    return typeof url === 'string' && url.length > 0 ? url : null;
  }

  private readSubscriptionCustomerId(body: unknown): string | null {
    const data = body as { data?: { attributes?: { customer_id?: number | string } } };
    const id = data.data?.attributes?.customer_id;
    if (id === undefined || id === null) return null;
    return String(id);
  }

  private async fetchAndPersistCustomerIdFromSubscription(
    userId: string,
    lsSubscriptionId: string,
  ): Promise<string | null> {
    try {
      const body = await this.lemonSqueezyApiGet(
        `/subscriptions/${encodeURIComponent(lsSubscriptionId)}`,
      );
      const customerId = this.readSubscriptionCustomerId(body);
      if (!customerId) return null;
      await this.prisma.user.update({
        where: { id: userId },
        data: { lsCustomerId: customerId },
      });
      this.logger.log(`Backfilled lsCustomerId for user ${userId} from subscription ${lsSubscriptionId}`);
      return customerId;
    } catch (e) {
      this.logger.warn(`Could not backfill customer id from subscription ${lsSubscriptionId}: ${e}`);
      return null;
    }
  }
}
