import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { CryptographyModule } from './common/modules/cryptography/cryptography.module';
import { configLogger } from './config/config.logger';
import { envSchema } from './config/env.validation';
import { HealthCheckModule } from './health-check/health-check.module';
import { HttpClientModule } from './http-client/http-client.module';
import { HttpClientService } from './http-client/http-client.service';
import { LoggingMiddleware } from './middleware/logger.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { SystemUsersModule } from './system-users/system-users.module';
import { BiometricsModule } from './biometrics/biometrics.module';

/**
 * This is the root module of the application that configures global middleware.
 * It applies the LoggingMiddleware to all routes in the application.
 */
@Module({
  imports: [
    PrismaModule,

    LoggerModule.forRoot(configLogger()),

    ConfigModule.forRoot({
      isGlobal: true,
      validate: (config) => {
        const result = envSchema.safeParse(config);
        if (!result.success) {
          throw new Error(JSON.stringify(result.error.format(), null, 2));
        }
        return result.data;
      },
    }),

    HealthCheckModule,

    HttpClientModule,

    AuthenticationModule,

    SystemUsersModule,

    BiometricsModule,

    CryptographyModule,
  ],
  controllers: [AppController],
  providers: [AppService, HttpClientService],
})
export class AppModule {
  /**
   * Configures middleware for the application.
   * @param consumer - The middleware consumer instance used to register middleware
   * @description Applies the LoggingMiddleware to all routes in the application
   */
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}
