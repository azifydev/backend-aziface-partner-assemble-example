import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from 'src/authentication/authentication.controller';

import {
  HttpClientService,
  HttpErrorResponse,
} from 'src/http-client/http-client.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { handleHttpClientError } from 'src/utils/http-error.util';
import {
  BiometricAuthTokenSessionDataDto,
  BiometricAuthTokenSessionDto,
  BiometricProcessDataDto,
  BiometricProcessDto,
} from '../dto/generic-error-maestro.dto';

@Injectable()
export class AssembleBiometricService {
  public readonly baseUrl: string;
  public readonly apiKey: string;

  constructor(
    private readonly httpClientService: HttpClientService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    this.baseUrl = this.configService.getOrThrow<string>(
      'ASSEMBLE_URL',
      'ASSEMBLE_URL is required',
    );
    this.apiKey = this.configService.getOrThrow<string>(
      'API_KEY',
      'API_KEY is required',
    );
  }

  private makeHeaders() {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
    };
  }

  async createTokenSession(
    user: AuthenticatedUser,
  ): Promise<BiometricAuthTokenSessionDataDto> {
    try {
      const users = await this.prismaService.users.findFirst({
        where: {
          id: user.id,
        },
      });

      if (!users) {
        throw new NotFoundException('User not found');
      }

      const endpoint = `${this.baseUrl}/biometric/sessions`;

      const headers = this.makeHeaders();

      const result = await this.httpClientService.post(
        endpoint,
        {
          userId: users.assemble_user_id,
        },
        {
          headers,
        },
      );

      const { error, data } = result as unknown as BiometricAuthTokenSessionDto;

      if (error) {
        throw new BadRequestException(
          'Error api Biometric create token session service',
        );
      }

      return data;
    } catch (error) {
      const errorResponse = error as HttpErrorResponse;

      handleHttpClientError(errorResponse);
    }
  }

  async createProcess(
    user: AuthenticatedUser,
  ): Promise<BiometricProcessDataDto> {
    try {
      const users = await this.prismaService.users.findFirst({
        where: {
          id: user.id,
        },
      });

      if (!users) {
        throw new NotFoundException('User not found');
      }

      const endpoint = `${this.baseUrl}/biometric/process`;

      const headers = this.makeHeaders();

      const result = await this.httpClientService.post(
        endpoint,
        {
          userId: users.assemble_user_id,
        },
        {
          headers,
        },
      );

      const { error, data } = result as unknown as BiometricProcessDto;

      if (error) {
        throw new BadRequestException(
          'Error api Biometric create token session service',
        );
      }

      return data;
    } catch (error) {
      const errorResponse = error as HttpErrorResponse;

      handleHttpClientError(errorResponse);
    }
  }
}
