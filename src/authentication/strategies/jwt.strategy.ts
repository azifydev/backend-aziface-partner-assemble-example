import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

import { PrismaService } from 'src/prisma/prisma.service';

import { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!,
    });
  }

  async validate(payload: JwtPayload): Promise<{
    id: string;
    name: string;
    external_id: string | null;
  } | null> {
    const user = await this.prismaService.system_users.findUnique({
      where: { id: payload.sub },
      include: {
        authentication: true,
      },
    });

    if (!user || user.deleted_at) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return {
      id: user.id,
      name: user.name!,
      external_id: user.external_id,
    };
  }
}
