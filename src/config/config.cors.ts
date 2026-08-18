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

const DEFAULT_METHODS = [
  'GET',
  'HEAD',
  'PUT',
  'PATCH',
  'POST',
  'DELETE',
  'OPTIONS',
];

/**
 * Configures CORS for browser clients.
 *
 * CORS_ORIGIN=* (or empty) reflects any request origin.
 * Otherwise it uses the comma-separated list, always including
 * https://azifaceweb.azify.dev.
 */
export function configCors(app: INestApplication): void {
  const configService = app.get<ConfigService>(ConfigService);
  const allowedOrigins = parseCorsOrigins(
    configService.get<string>('CORS_ORIGIN'),
  );

  const corsOptions: CorsOptions = {
    origin: (requestOrigin, callback) => {
      if (!requestOrigin || isOriginAllowed(requestOrigin, allowedOrigins)) {
        callback(null, true);
        return;
      }

      callback(null, false);
    },
    methods: DEFAULT_METHODS,
    allowedHeaders: DEFAULT_ALLOWED_HEADERS,
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
    maxAge: 86_400,
  };

  app.enableCors(corsOptions);
}

function normalizeOrigin(origin: string): string {
  return origin.trim().replace(/\/+$/, '');
}

function parseCorsOrigins(corsOrigin?: string): true | string[] {
  const frontendOrigin = 'https://azifaceweb.azify.dev';

  if (!corsOrigin || corsOrigin.trim() === '*') {
    return true;
  }

  const origins = corsOrigin
    .split(',')
    .map((origin) => normalizeOrigin(origin))
    .filter(Boolean);

  if (origins.length === 0 || origins.includes('*')) {
    return true;
  }

  return [...new Set([...origins, frontendOrigin])];
}

function isOriginAllowed(
  requestOrigin: string,
  allowedOrigins: true | string[],
): boolean {
  if (allowedOrigins === true) {
    return true;
  }

  return allowedOrigins.includes(normalizeOrigin(requestOrigin));
}
