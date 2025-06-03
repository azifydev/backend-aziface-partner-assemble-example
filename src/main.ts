import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setGlobalPrefix('api/v1.0', {
    exclude: [
      { path: 'panel', method: RequestMethod.ALL },
      { path: 'panel/*path', method: RequestMethod.ALL },
    ],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: errors.map(err => ({
            field: err.property,
            messages: Object.values(err.constraints || {}),
          })),
        });
      },
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'static'), {
    prefix: '/static',
  });
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('twig');

  await app.listen(3000);
}
bootstrap();
