import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEFAULT_ALLOWED_HEADERS = [
  'Content-Type',
  'Accept',
  'Authorization',
  'x-api-key',
  'X-Api-Key',
  'X-API-KEY',
  'X-Requested-With',
];

/**
 * Configures CORS settings for the NestJS application.
 *
 * - In development or test, reflects the request origin (any origin) with credentials.
 * - In production, uses CORS_ORIGIN (one origin or a comma-separated list).
 *   A value of '*' is treated as reflecting the request origin so credentials stay valid.
 *
 * @param app - The NestJS application instance to configure
 */
export function configCors(app: INestApplication): void {
  const configService = app.get<ConfigService>(ConfigService);

  const nodeEnv = configService.get<string>('NODE_ENV')!;

  const isNonProductionEnv = ['development', 'test'].includes(nodeEnv);

  const origin = isNonProductionEnv
    ? true
    : parseCorsOrigins(configService.get<string>('CORS_ORIGIN'));

  const corsOptions: CorsOptions = {
    origin,
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: DEFAULT_ALLOWED_HEADERS,
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  };

  app.enableCors(corsOptions);
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
