import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Configures CORS settings for the NestJS application.
 *
 * - In development or test, reflects the request origin (any origin) with credentials.
 * - In production, uses CORS_ORIGIN (one origin or a comma-separated list).
 *   A value of '*' is treated as reflecting the request origin so credentials stay valid.
 *
 * @param app - The NestJS application instance to configure
 *
 * @example
 * ```typescript
 * // In your main.ts file
 * const app = await NestFactory.create(AppModule);
 * configCors(app);
 * await app.listen(3000);
 * ```
 */
export function configCors(app: INestApplication): void {
  const configService = app.get<ConfigService>(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV')!;

  const isNonProductionEnv = ['development', 'test'].includes(nodeEnv);

  const origin = isNonProductionEnv
    ? true
    : parseCorsOrigins(configService.get<string>('CORS_ORIGIN'));

  app.enableCors({
    origin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: [
      'Content-Type',
      'Accept',
      'Authorization',
      'x-api-key',
      'X-Requested-With',
    ],
    credentials: true,
  });
}

function parseCorsOrigins(corsOrigin?: string): boolean | string | string[] {
  if (!corsOrigin || corsOrigin === '*') {
    return true;
  }

  const origins = corsOrigin
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  if (origins.length === 0) {
    return true;
  }

  return origins.length === 1 ? origins[0] : origins;
}
