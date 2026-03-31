import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';

async function bootstrap() {
  /**
   * `rawBody: true` — Webhooks (Lemon Squeezy `X-Signature`, Stripe) must HMAC the **exact** bytes
   * the provider sent. Nest wires body-parser `verify` so each JSON request also sets `req.rawBody`
   * (Buffer) before `req.body` is parsed. Never sign `JSON.stringify(req.body)`; key order/spacing
   * differs and verification will fail (e.g. persistent 401 on Lemon Squeezy).
   */
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });

  const allowedOrigins = new Set(
    [
      process.env.FRONTEND_URL,
      'http://localhost:5001',
      'http://localhost:5173',
      'https://www.cropai.es',
      'https://cropai.es',
    ].filter(Boolean),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
      } else {
        callback(new Error('No permitido por CORS - Seguridad Vinomio'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
bootstrap();
