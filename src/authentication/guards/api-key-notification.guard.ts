import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { Request } from 'express';

@Injectable()
export class ApiKeyNotificationGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKeyHeader =
      request.headers['x-api-key'] || request.headers['X-API-KEY'];
    const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;
    const envApiKey = this.configService.get<string>('API_KEY_NOTIFICATION');
    if (!apiKey || apiKey !== envApiKey) {
      throw new UnauthorizedException('Invalid or missing API key');
    }
    return true;
  }
}
