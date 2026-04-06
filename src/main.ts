import 'dotenv/config';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationError } from 'class-validator';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

function flattenValidationErrors(
  errors: ValidationError[],
  prefix = '',
): Array<{ path: string; messages: string[]; value: unknown }> {
  const rows: Array<{ path: string; messages: string[]; value: unknown }> = [];
  for (const err of errors) {
    const path = prefix ? `${prefix}.${err.property}` : err.property;
    if (err.constraints && Object.keys(err.constraints).length > 0) {
      rows.push({
        path,
        messages: Object.values(err.constraints),
        value: err.value,
      });
    }
    if (err.children?.length) {
      rows.push(...flattenValidationErrors(err.children, path));
    }
  }
  return rows;
}

async function bootstrap() {
  /**
   * `rawBody: true` — Webhooks (Lemon Squeezy `X-Signature`) must HMAC the **exact** bytes
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
      'http://127.0.0.1:5001',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
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
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'x-farm-id',
      'X-Requested-With',
    ],
    credentials: true,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api');

  const validationLogger = new Logger('ValidationPipe');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const rows = flattenValidationErrors(validationErrors);
        const lines = rows.map(
          (r) =>
            `  • ${r.path}: ${r.messages.join(' | ')} — value=${JSON.stringify(r.value)}`,
        );
        validationLogger.warn(
          `Body validation failed (${rows.length} issue(s)):\n${lines.join('\n')}`,
        );
        if (rows.some((r) => r.messages.some((m) => m.includes('should not exist')))) {
          validationLogger.warn(
            '→ Campos rechazados por whitelist: el proceso del API suele estar corriendo un build VIEJO sin esas propiedades en CreateSupplyDto. En vinomio-backend: npm run build, luego reinicia start:dev o start:prod.',
          );
        }
        const message = rows.flatMap((r) => r.messages);
        const isProd = process.env.NODE_ENV === 'production';
        return new BadRequestException({
          statusCode: 400,
          error: 'Bad Request',
          message: message.length > 0 ? message : validationErrors,
          ...(isProd ? {} : { validationDetails: rows }),
        });
      },
    }),
  );

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port, '0.0.0.0');
  Logger.log(`API listening on :${port} (globalPrefix=api)`, 'Bootstrap');
}
bootstrap();
