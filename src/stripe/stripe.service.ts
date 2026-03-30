import { Injectable, BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';
import { UsersService } from '../users/users.service';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;

  constructor(private readonly usersService: UsersService) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('Missing STRIPE_SECRET_KEY');
    }

    this.stripe = new Stripe(secretKey);
  }

  /**
   * Checkout needs a Price id (`price_...`). You can pass `productId` (`prod_...`)
   * and we pick the first active recurring price for that product.
   */
  async createCheckoutSession(params: {
    userEmail: string;
    priceId?: string;
    productId?: string;
  }) {
    const resolvedPriceId = await this.resolveSubscriptionPriceId(params);
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: resolvedPriceId,
          quantity: 1,
        },
      ],
      customer_email: params.userEmail,
      success_url: `${this.checkoutAppOrigin()}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${this.checkoutAppOrigin()}/cancel`,
    });

    if (!session.url) {
      throw new BadRequestException(
        'Stripe Checkout session did not return a URL',
      );
    }

    return { url: session.url };
  }

  /** Abre el Customer Portal de Stripe (cancelar o cambiar plan). Requiere portal activado en el Dashboard de Stripe. */
  async createBillingPortalSession(userEmail: string, returnUrl?: string) {
    const email = userEmail?.trim();
    if (!email) {
      throw new BadRequestException('userEmail es requerido');
    }

    const customers = await this.stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) {
      throw new BadRequestException(
        'No hay cliente de Stripe con este email. Si recién pagaste, esperá unos minutos.',
      );
    }

    const resolved = returnUrl?.trim() || `${this.checkoutAppOrigin()}/`;

    const session = await this.stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: resolved,
    });

    if (!session.url) {
      throw new BadRequestException('Stripe no devolvió URL del portal de facturación');
    }

    return { url: session.url };
  }

  /**
   * Estado real en Stripe: Pro si hay suscripción activa/trial/past_due para STRIPE_PRODUCT_ID
   * (o cualquier suscripción activa si no hay producto configurado).
   * `currentPeriodEnd` = fin del período de facturación actual (ISO 8601).
   */
  async getSubscriptionStatusForEmail(userEmail: string): Promise<{
    isPro: boolean;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  }> {
    const email = userEmail?.trim();
    if (!email) {
      throw new BadRequestException('userEmail es requerido');
    }

    const customers = await this.stripe.customers.list({ email, limit: 1 });
    const customer = customers.data[0];
    if (!customer) {
      return { isPro: false, currentPeriodEnd: null, cancelAtPeriodEnd: false };
    }

    const subs = await this.stripe.subscriptions.list({
      customer: customer.id,
      status: 'all',
      limit: 100,
      expand: ['data.items.data.price'],
    });

    const productId = process.env.STRIPE_PRODUCT_ID?.trim();
    const grantingStatuses = new Set(['active', 'trialing', 'past_due']);

    for (const sub of subs.data) {
      if (!grantingStatuses.has(sub.status)) {
        continue;
      }

      let matchingItem: Stripe.SubscriptionItem | undefined;
      if (productId?.startsWith('prod_')) {
        for (const item of sub.items.data) {
          const price = item.price;
          if (typeof price === 'string') {
            continue;
          }
          const p = price.product;
          const pid = typeof p === 'string' ? p : p?.id;
          if (pid === productId) {
            matchingItem = item;
            break;
          }
        }
      } else {
        matchingItem = sub.items.data[0];
      }

      if (!matchingItem) {
        continue;
      }

      const endSec = matchingItem.current_period_end;
      return {
        isPro: true,
        currentPeriodEnd:
          typeof endSec === 'number'
            ? new Date(endSec * 1000).toISOString()
            : null,
        cancelAtPeriodEnd: sub.cancel_at_period_end === true,
      };
    }

    return { isPro: false, currentPeriodEnd: null, cancelAtPeriodEnd: false };
  }

  async getCheckoutSessionStatus(sessionId: string) {
    const checkoutSession = await this.stripe.checkout.sessions.retrieve(sessionId);
    const customerEmail =
      checkoutSession.customer_details?.email ??
      checkoutSession.customer_email ??
      null;

    return {
      status: checkoutSession.status,
      paymentStatus: checkoutSession.payment_status,
      customerEmail,
    };
  }

  /** Base URL of the SPA (no trailing slash). Local dev: http://localhost:5001 */
  private checkoutAppOrigin(): string {
    const raw = process.env.FRONTEND_URL?.trim() || 'http://localhost:5001';
    return raw.replace(/\/$/, '');
  }

  private async resolveSubscriptionPriceId(params: {
    priceId?: string;
    productId?: string;
  }): Promise<string> {
    const priceId =
      params.priceId?.trim() || process.env.STRIPE_PRICE_ID?.trim();
    const productId =
      params.productId?.trim() || process.env.STRIPE_PRODUCT_ID?.trim();

    if (priceId?.startsWith('price_')) {
      return priceId;
    }

    if (productId?.startsWith('prod_')) {
      const prices = await this.stripe.prices.list({
        product: productId,
        active: true,
        limit: 20,
      });
      const recurring = prices.data.find((p) => p.type === 'recurring');
      const chosen = recurring ?? prices.data[0];
      if (!chosen) {
        throw new BadRequestException(
          'No hay un precio activo para este producto en Stripe',
        );
      }
      return chosen.id;
    }

    if (priceId) {
      throw new BadRequestException(
        'priceId debe ser un id de Stripe que empiece con price_',
      );
    }

    throw new BadRequestException(
      'Configurá STRIPE_PRICE_ID o STRIPE_PRODUCT_ID en .env, o enviá priceId/productId en el body',
    );
  }

  constructWebhookEvent(rawBody: Buffer, signature: string) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('Missing STRIPE_WEBHOOK_SECRET');
    }

    return this.stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  }

  async handleWebhookEvent(event: Stripe.Event) {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.customer_email;
      if (email) {
        await this.usersService.activatePro(email);
      }
      return;
    }

    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.status === 'canceled') {
        const email = await this.getSubscriptionCustomerEmail(subscription);
        if (email) {
          await this.usersService.deactivatePro(email);
        }
      }
      return;
    }

    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object as Stripe.Subscription;
      const email = await this.getSubscriptionCustomerEmail(subscription);
      if (email) {
        await this.usersService.deactivatePro(email);
      }
    }
  }

  private async getSubscriptionCustomerEmail(subscription: Stripe.Subscription) {
    const customerId =
      typeof subscription.customer === 'string'
        ? subscription.customer
        : subscription.customer?.id;

    if (!customerId) {
      return null;
    }

    const customer = await this.stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return null;
    }

    return customer.email ?? null;
  }
}
