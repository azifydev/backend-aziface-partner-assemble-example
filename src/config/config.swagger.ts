import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

import type { INestApplication } from '@nestjs/common';
import {
  DocumentBuilder,
  SwaggerModule,
  type OpenAPIObject,
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
    .setTitle('Assemble API')
    .setDescription('Documentação da API Assemble')
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
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Admin Wisiex ApiKey',
      },
      'x-api-key-admin',
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

export function configSwaggerInternal(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Assemble API - Interna')
    .setDescription('Documentação interna da API Assemble')
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
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Admin Wisiex ApiKey',
      },
      'x-api-key-admin',
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

  let internalDocument = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  internalDocument.paths = Object.fromEntries(
    Object.entries(internalDocument.paths).filter(([, methods]) =>
      Object.values(methods).some((method: OperationObject) =>
        method.tags?.some((tag: string) => tag.startsWith('internal')),
      ),
    ),
  );
  internalDocument = filterUnusedSchemas(internalDocument);

  const docsPath = join(process.cwd(), 'swagger', 'docs-internal');
  mkdirSync(docsPath, { recursive: true });

  const swaggerPath = join(docsPath, 'swagger-internal.json');
  writeFileSync(swaggerPath, JSON.stringify(internalDocument, null, 2));

  SwaggerModule.setup('api-docs-internal', app, internalDocument);
}

function filterUnusedSchemas(document: OpenAPIObject): OpenAPIObject {
  const usedSchemas = new Set<string>();

  function collectUsedSchemas(obj: unknown): void {
    if (obj && typeof obj === 'object') {
      for (const [key, value] of Object.entries(
        obj as Record<string, unknown>,
      )) {
        if (key === '$ref' && typeof value === 'string') {
          const match = value.match(/^#\/components\/schemas\/(.+)$/);
          if (match) {
            usedSchemas.add(match[1]);
          }
        } else {
          collectUsedSchemas(value);
        }
      }
    }
  }

  for (const pathItem of Object.values(document.paths)) {
    for (const method of Object.values(pathItem)) {
      collectUsedSchemas(method);
    }
  }

  if (document.components?.schemas) {
    document.components.schemas = Object.fromEntries(
      Object.entries(document.components.schemas).filter(([key]) =>
        usedSchemas.has(key),
      ),
    );
  }

  return document;
}
