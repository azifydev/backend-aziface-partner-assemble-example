import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PartnerApiKeyGuard implements CanActivate {
  private readonly logger: Logger = new Logger(PartnerApiKeyGuard.name);
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<any>();

    if (process.env.DEBUG_PARNTER_INFO) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data = JSON.parse(process.env.DEBUG_PARNTER_INFO);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      request.partner = data;

      this.logger.warn(
        `USING DEBUG CONFIG [PARTNER]\n${JSON.stringify(data, null, 2)}`,
      );
      return true;
    }

    // Extract API key from headers
    const apiKeyHeader =
      request.headers['x-api-key'] || request.headers['X-API-KEY'];
    const apiKey = Array.isArray(apiKeyHeader) ? apiKeyHeader[0] : apiKeyHeader;

    if (!apiKey) {
      throw new UnauthorizedException('Missing x-api-key header');
    }

    try {
      // Use the service to validate the API key and get partner information
      const configApiKey = this.configService.get<number>('API_KEY');

      if (apiKey !== configApiKey) {
        throw new UnauthorizedException('Invalid API key');
      }

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to validate API key';

      if (errorMessage === 'Invalid API key') {
        throw new UnauthorizedException('Invalid API key');
      }

      if (errorMessage === 'Partner account is inactive') {
        throw new UnauthorizedException('Partner account is inactive');
      }

      // Handle any other errors
      throw new UnauthorizedException('Failed to validate API key');
    }
  }
}

export interface PartnerInfo {
  id: PartnerId;
  name: string;
  external_id_maestro: string;
  partner_id_watchman?: string | null;
  credentials_maestro: {
    client_id: string;
    client_secret: string;
  };
  credentials_aziface: {
    client_id: string;
    client_secret: string;
  };
}
export interface RequestWithPartner extends Request {
  partner?: PartnerInfo;
}

export type PartnerId = string;