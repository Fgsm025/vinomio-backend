import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
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

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`${eventName}: no user found for id=${userId}`);
      return;
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: { planStatus, lsSubscriptionId, endsAt },
    });

    this.logger.log(
      `${eventName}: user ${userId} → planStatus=${planStatus}, endsAt=${endsAt?.toISOString() ?? 'null'}, lsSub=${lsSubscriptionId}`,
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

  async getCustomerPortalUrlForUser(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lsSubscriptionId: true },
    });

    if (!user || !user.lsSubscriptionId) {
      throw new BadRequestException('No Lemon Squeezy subscription found for this user');
    }

    const base = process.env.LEMON_SQUEEZY_CUSTOMER_PORTAL_URL?.trim();
    if (!base) {
      this.logger.error('LEMON_SQUEEZY_CUSTOMER_PORTAL_URL is not set');
      throw new InternalServerErrorException('Customer portal URL is not configured');
    }

    return base;
  }
}
