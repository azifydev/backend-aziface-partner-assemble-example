/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NestMiddleware, OnModuleInit } from '@nestjs/common';

import { Request, Response, NextFunction } from 'express';
import { Logger } from 'nestjs-pino';

let LOGGER: Logger | null = null;

/**
 * Middleware that logs both incoming HTTP requests and outgoing responses.
 *
 * This middleware attaches to the NestJS request pipeline and captures detailed
 * information about each HTTP transaction for logging purposes.
 *
 * @implements {NestMiddleware} NestJS middleware interface
 * @implements {OnModuleInit} NestJS lifecycle hook interface
 *
 * @example
 * // Register in your module
 * export class AppModule implements NestModule {
 *   configure(consumer: MiddlewareConsumer) {
 *     consumer.apply(LoggingMiddleware).forRoutes('*');
 *   }
 * }
 *
 * @remarks
 * The middleware logs request details including headers (with authorization
 * redacted), query parameters, body, IP, and user agent. It also intercepts
 * the response by overriding the `send` method to log response status and body.
 *
 * When the module initializes, it ensures a global logger instance is available
 * for capturing response data even after the request context is completed.
 */
@Injectable()
export class LoggingMiddleware implements NestMiddleware, OnModuleInit {
  public constructor(private readonly logger: Logger) {}

  onModuleInit(): void {
    if (!LOGGER) {
      LOGGER = this.logger;
    }
  }

  /**
   * Middleware function for logging incoming requests and outgoing responses.
   *
   * @param req - The Express request object containing request details like method, URL, headers, etc.
   * @param res - The Express response object that will be modified to log response data.
   * @param next - The Express next function to pass control to the next middleware.
   *
   * This middleware:
   * 1. Logs detailed information about incoming requests including:
   *    - HTTP method
   *    - URL
   *    - Headers (with authorization redacted for security)
   *    - URL parameters
   *    - Query parameters
   *    - Request body
   *    - Client IP address
   *    - User agent
   *
   * 2. Intercepts the response by overriding the `send` method to log:
   *    - Response message
   *    - Timestamp
   *    - HTTP method
   *    - URL
   *    - Status code
   *    - Response body
   *
   * Note: Uses a global LOGGER instance to record the response data.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    const { method, originalUrl, body, query, params, headers, ip } = req;
    const timestamp = new Date().toISOString();

    // Log da requisição recebida
    this.logger.log({
      message: 'INCOMING REQUEST',
      timestamp,
      method,
      url: originalUrl,
      headers: {
        ...headers,
        authorization: headers.authorization ? '<redacted>' : undefined,
      },
      params,
      query,
      body,
      ip,
      userAgent: headers['user-agent'],
    });

    // Log da resposta quando ela for enviada
    const originalSend = res.send;
    res.send = function (data: unknown): Response {
      const responseData = {
        message: 'OUTGOING RESPONSE',
        timestamp: new Date().toISOString(),
        method,
        url: originalUrl,
        statusCode: res.statusCode,
        responseBody: data,
      };

      if (LOGGER) {
        LOGGER.log(responseData);
      }
      // Ensure correct typing and avoid unsafe return
      return originalSend.call(this, data) as Response;
    };

    next();
  }
}
