/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import type { Request, Response } from 'express';
import type { Params } from 'nestjs-pino';

const headers = (req: Request) => ({
  ...req.headers,
  authorization: req.headers.authorization ? '<redacted>' : undefined,
});

const serializers = {
  req: (req: Request) => ({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    protocol: req.secure ? 'https' : 'http',
    hostname: req.hostname,
    ip: req.ip,
    originalIp: req.headers['x-forwarded-for'] || req.ip,
    headers: headers(req),
    params: req.params,
    query: req.query,
    body: req.body || {},
    cookies: req.cookies || {},
    secure: req.secure || false,
    httpVersion: req.httpVersion,
    userAgent: req.headers['user-agent'],
  }),
  res: (res: Response) => ({
    statusCode: res.statusCode,
    headers: res?.getHeaders?.(),
  }),
};

/**
 * Configures and returns logger parameters for the application.
 *
 * This function sets up Pino HTTP logger with different configurations based on
 * the environment. In development, it enables debug level logging with colorized
 * and formatted output via pino-pretty. In production, it uses info level with
 * default transport.
 *
 * @returns {Params} Logger configuration parameters with pinoHttp settings
 *   including custom formatters, serializers, and dynamic log level determination
 *   based on response status codes.
 */
export function configLogger(): Params {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return {
    pinoHttp: {
      name: 'assemble',
      level: isDevelopment ? 'debug' : 'info',
      transport: isDevelopment
        ? {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:standard',
              ignore: 'pid,hostname',
              singleLine: true,
            },
          }
        : undefined,
      formatters: {
        level: (label) => {
          return { level: label };
        },
      },
      serializers,
      customLogLevel(req, res, err) {
        if (res.statusCode >= 400 && res.statusCode < 500) {
          return 'warn';
        } else if (res.statusCode >= 500 || err) {
          return 'error';
        }
        return 'info';
      },
      customSuccessMessage(req, res) {
        return `${req.method} ${req.url} - ${res.statusCode}`;
      },
      customErrorMessage(req, res, err) {
        return `${req.method} ${req.url} - ${res.statusCode} - ${err.message}`;
      },
    },
  };
}
