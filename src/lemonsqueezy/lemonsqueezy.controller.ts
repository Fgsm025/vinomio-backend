import { BadRequestException, Controller, HttpCode, Post, Req } from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { LemonSqueezyService, type LemonSqueezyWebhookPayload } from './lemonsqueezy.service';

@Controller('webhooks/lemonsqueezy')
export class LemonSqueezyController {
  constructor(private readonly lemonSqueezyService: LemonSqueezyService) {}

  /** Requires `rawBody: true` in `main.ts` — signature is computed over `req.rawBody`, not `req.body`. */
  @Post()
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
}
