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
    assemble_user_id: string | null;
  } | null> {
    const user = await this.prismaService.users.findUnique({
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
      assemble_user_id: user.assemble_user_id,
    };
  }
}
