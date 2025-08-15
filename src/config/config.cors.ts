import type { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Configures CORS settings for the NestJS application
 *
 * This function enables CORS with different origins based on the environment:
 * - In development or test environments, it allows all origins ('*')
 * - In production, it uses the CORS_ORIGIN environment variable or falls back to 'https://assemble.com'
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

  const allowedOrigins = isNonProductionEnv
    ? '*'
    : configService.get<string>('CORS_ORIGIN') || 'https://assemble.com';

  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Accept',
    credentials: true,
  });
}
