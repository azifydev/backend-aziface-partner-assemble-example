import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
} from '@nestjs/swagger';

import type { OperationObject } from 'openapi3-ts/dist/oas30';

/**
 * Configures Swagger documentation for the NestJS application.
 * Sets up the Swagger UI at the '/docs' endpoint with basic API information.
 *
 * @param app - The NestJS application instance to configure Swagger for
 * @returns The configured NestJS application instance
 */
export function configSwagger(app: INestApplication): INestApplication<any> {
  const config = new DocumentBuilder()
    .setTitle('Backend Aziface Partner Assemble Example API')
    .setDescription('Documentação da API Backend Aziface Partner Assemble Example')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Partner ApiKey',
      },
      'x-api-key-partner',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        in: 'header',
        name: 'bearer',
        description: 'Autorization Bearer',
      },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);

  document.paths = Object.fromEntries(
    Object.entries(document.paths).filter(
      ([, methods]) =>
        !Object.values(methods).some((method: OperationObject) =>
          method.tags?.some((tag: string) => tag.startsWith('internal')),
        ),
    ),
  );

  const docsPath = join(process.cwd(), 'swagger', 'docs');
  mkdirSync(docsPath, { recursive: true });

  const swaggerPath = join(docsPath, 'swagger.json');
  writeFileSync(swaggerPath, JSON.stringify(document, null, 2));

  SwaggerModule.setup('api-docs', app, document);
  return app;
}

