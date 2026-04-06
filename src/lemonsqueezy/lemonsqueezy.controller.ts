import { BadRequestException, Controller, Get, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { LemonSqueezyService, type LemonSqueezyWebhookPayload } from './lemonsqueezy.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, type CurrentUserPayload } from '../auth/decorators/current-user.decorator';

@Controller()
export class LemonSqueezyController {
  constructor(private readonly lemonSqueezyService: LemonSqueezyService) {}

  /** Requires `rawBody: true` in `main.ts` — signature is computed over `req.rawBody`, not `req.body`. */
  @Post('webhooks/lemonsqueezy')
  @HttpCode(200)
  async handleWebhook(@Req() req: RawBodyRequest<Request>) {
    const rawBody = req.rawBody;
    const xSignature = req.headers['x-signature'];
    this.lemonSqueezyService.assertValidWebhookSignature(rawBody, xSignature);

    let payload: LemonSqueezyWebhookPayload;
    try {
      payload = JSON.parse(rawBody.toString('utf8')) as LemonSqueezyWebhookPayload;
    } catch {
      throw new BadRequestException('Invalid JSON body');
    }

    await this.lemonSqueezyService.handleWebhookPayload(payload ?? {});
    return { received: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('billing-portal')
  async billingPortal(@CurrentUser() user: CurrentUserPayload) {
    const url = await this.lemonSqueezyService.getBillingPortalUrlForUser(user.userId);
    return { url };
  }

  /** @deprecated Prefer GET /api/billing-portal */
  @UseGuards(JwtAuthGuard)
  @Get('lemonsqueezy/customer-portal')
  async customerPortal(@CurrentUser() user: CurrentUserPayload) {
    const url = await this.lemonSqueezyService.getBillingPortalUrlForUser(user.userId);
    return { url };
  }
}
