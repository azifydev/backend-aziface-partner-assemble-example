import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';

import { AppModule } from 'src/app.module';
import {
  configSwagger,
} from 'src/config/config.swagger';

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
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  configSwagger(app);
}

void bootstrap();
