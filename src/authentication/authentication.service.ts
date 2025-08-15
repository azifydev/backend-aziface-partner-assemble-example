import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { hashSync, compare } from 'bcrypt';

import { PrismaService } from 'src/prisma/prisma.service';

import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { AuthenticationDto } from './dto/authentication.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  public async createAuthentication(data: AuthenticationDto): Promise<void> {
    const baseSecret = data.password;
    const hashedSecret = hashSync(baseSecret, 10);

    await this.prismaService.authentication.create({
      data: {
        username: data.username,
        secret: hashedSecret,
        user_id: data.userId,
      },
    });
  }

  public async login(authLoginDto: AuthLoginDto): Promise<AuthResponseDto> {
    const { username, password } = authLoginDto;

    const systemUser = await this.prismaService.system_users.findFirst({
      select: {
        id: true,
        name: true,
        external_id: true,
        deleted_at: true,
        authentication: {
          select: {
            secret: true,
            username: true,
          },
        },
      },
      where: {
        authentication: {
          some: {
            username: {
              equals: username,
            },
          },
        },
      },
    });

    if (!systemUser || systemUser.deleted_at) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar se existe autenticação para o usuário
    if (systemUser.authentication.length === 0) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verificar a senha
    const [authentication] = systemUser.authentication;
    const isValid = await compare(password, authentication.secret);

    if (!isValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Gerar JWT token
    const payload: Omit<JwtPayload, 'iat' | 'exp'> = {
      sub: systemUser.id,
      name: systemUser.name || undefined,
      external_id: systemUser.external_id || undefined,
    };

    const expiresIn = this.configService.get<number>('JWT_EXPIRES_IN') || 3600;
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: `${expiresIn}s`,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn,
      user: {
        id: systemUser.id,
        name: systemUser.name || undefined,
      },
    };
  }

  public async validateUser(
    userId: string,
  ): Promise<{ id: string; name: string } | null> {
    const user = await this.prismaService.system_users.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user || user.deleted_at) {
      return null;
    }

    return {
      id: user.id,
      name: user.name ?? '',
    };
  }
}
