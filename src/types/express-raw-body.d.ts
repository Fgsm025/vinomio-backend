/**
 * Populated by Nest when `NestFactory.create(..., { rawBody: true })`:
 * body-parser `verify` runs before JSON parse and assigns the incoming bytes.
 */
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}

export {};
