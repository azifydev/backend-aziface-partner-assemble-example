import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import express from 'express';
import helmet from 'helmet';

import { AppModule } from './app.module';
import { configAppEnv } from './config/config.app.env';
import { configCors } from './config/config.cors';
import { configSwagger } from './config/config.swagger';
export type Teste = 'teste';

/**
 * Bootstrap function to initialize and configure the NestJS application.
 *
 * This function:
 * 1. Creates a new NestJS application instance with buffer logging enabled
 * 2. Initializes the application
 * 3. Retrieves the configuration service to get the port number
 * 4. Sets up a logger for bootstrap operations
 * 5. Configures Swagger documentation
 * 6. Configures environment settings
 * 7. Sets up CORS protection
 * 8. Implements Helmet security middleware
 * 9. Starts the HTTP server on the specified port
 *
 * @returns {Promise<void>} A promise that resolves when the application has started
 */
async function bootstrap(): Promise<void> {
  console.time('Application Startup Time');
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bufferLogs: true,
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
  const baseUrl = configService.get<string>('BASE_URL') || '0.0.0.0';

  const logger = new Logger('Bootstrap');

  app.useLogger(logger);

  configSwagger(app);

  configAppEnv();

  configCors(app);

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  await app.init();
  await app.listen(port, baseUrl, () => {
    logger.log(`Application is running on: http://localhost:${port}`);
    logger.log(
      `API documentation available at: http://localhost:${port}/api-docs`,
    );
    console.timeEnd('Application Startup Time');
    console.log(`Application Started In ${process.uptime()} seconds`);
  });
}

console.time('Start Console.Time');
console.timeEnd('Start Console.Time');
void bootstrap();
