import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { Request } from 'express';
import { StripeService } from './stripe.service';

type CreateCheckoutSessionBody = {
  userEmail: string;
  priceId?: string;
  productId?: string;
};

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('create-checkout-session')
  async createCheckoutSession(@Body() body: CreateCheckoutSessionBody) {
    return this.stripeService.createCheckoutSession({
      userEmail: body.userEmail,
      priceId: body.priceId,
      productId: body.productId,
    });
  }

  @Get('session-status')
  async sessionStatus(@Query('session_id') sessionId?: string) {
    if (!sessionId?.trim()) {
      throw new BadRequestException('Missing session_id');
    }
    return this.stripeService.getCheckoutSessionStatus(sessionId.trim());
  }

  @Post('webhook')
  @HttpCode(200)
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature?: string,
  ) {
    if (!signature) {
      throw new BadRequestException('Missing stripe-signature header');
    }
    if (!req.rawBody) {
      throw new BadRequestException('Missing raw request body');
    }

    const event = this.stripeService.constructWebhookEvent(
      req.rawBody,
      signature,
    );

    await this.stripeService.handleWebhookEvent(event);

    return { received: true };
  }
}
