/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

import { PrismaService } from 'src/prisma/prisma.service';

import { AuthenticationRecord } from '../interfaces/authentication-with-patner.interface';

export interface UserInfo {
  id: string;

  [key: string]: unknown;
}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);
  constructor(private readonly prismaService: PrismaService) {
    super();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<any>();
    if (process.env.DEBUG_USER) {
      const data = JSON.parse(process.env.DEBUG_USER);

      request.user = data;
      this.logger.warn(
        `USING DEBUG CONFIG [USER]\n${JSON.stringify(data, null, 2)}`,
      );
      return true;
    }
    const canActivate = await super.canActivate(context);

    if (!canActivate) {
      return false;
    }

    return await this.validateUserAndInjectPartner(request);
  }

  private async validateUserAndInjectPartner(request: any): Promise<boolean> {
    if (process.env.DEBUG_USER) {
      const data = JSON.parse(process.env.DEBUG_USER);

      request.user = data;

      this.logger.warn(
        `USING DEBUG CONFIG [USER]\n${JSON.stringify(data, null, 2)}`,
      );
      return true;
    }

    const { user } = request;

    if (!user || !user.id) {
      throw new UnauthorizedException('User information not found in token');
    }

    try {
      const result = await this.fetchAuthenticationData(user.id);
      this.validateAuthenticationResult(result);
      this.injectPartnerAndUserInfo(request, result);

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      // Handle any database errors
      throw new UnauthorizedException('Failed to validate user authentication');
    }
  }

  private async fetchAuthenticationData(
    userId: string,
  ): Promise<AuthenticationRecord | null> {
    const data = await this.prismaService.authentication.findFirst({
      where: {
        user_id: userId,
        deleted_at: null,
      },
      include: {
        system_users: {
          select: {
            external_id: true,
          },
        },
      },
    });

    return data as AuthenticationRecord;
  }

  private validateAuthenticationResult(
    result: AuthenticationRecord | null,
  ): void {
    if (!result) {
      throw new UnauthorizedException('Authentication record not found');
    }
  }

  private injectPartnerAndUserInfo(
    request: any,
    result: AuthenticationRecord | null,
  ): void {
    const authResult = result as AuthenticationRecord;

    request.user = {
      id: authResult.user_id,
      external_id: authResult.system_users.external_id,
    };
  }
}
