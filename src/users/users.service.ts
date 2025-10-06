import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { AuthenticationService } from 'src/authentication/authentication.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly authenticationService: AuthenticationService,
    private readonly configService: ConfigService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const authentication = await this.prismaService.authentication.findFirst({
      where: {
        username: createUserDto.username,
      },
    });

    if (authentication) {
      throw new BadRequestException('Username is already in use');
    }

    const assembleUser = this.configService.get<string>('ASSEMBLE_USER');
    const assemblePassword =
      this.configService.get<string>('ASSEMBLE_PASSWORD');

    if (!assembleUser || !assemblePassword) {
      throw new BadRequestException('Assemble credentials are not set');
    }

    if (
      !createUserDto.username.includes(assembleUser) ||
      !createUserDto.password.includes(assemblePassword)
    ) {
      throw new BadRequestException('Invalid Assemble credentials');
    }

    const data = await this.prismaService.users.create({
      data: {
        name: createUserDto.name,
        assemble_user_id: createUserDto?.assembleUserId,
      },
      select: {
        id: true,

        name: true,
        assemble_user_id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });

    await this.authenticationService.createAuthentication({
      userId: data.id,
      username: createUserDto.username,
      password: createUserDto.password,
    });

    return new UserDto({
      id: data.id,

      name: data.name,
      assembleUserId: data.assemble_user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    });
  }

  async findAll(): Promise<UserDto[]> {
    const data = await this.prismaService.users.findMany({
      select: {
        id: true,

        name: true,
        assemble_user_id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
      where: {
        deleted_at: null,
      },
    });
    return data.map(
      (item) =>
        new UserDto({
          id: item.id,
          name: item.name,
          assembleUserId: item.assemble_user_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          deletedAt: item.deleted_at,
        }),
    );
  }

  async findOne(id: string): Promise<UserDto | null> {
    const data = await this.prismaService.users.findUnique({
      where: { id },
      select: {
        id: true,

        name: true,
        assemble_user_id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });
    if (!data) return null;
    return new UserDto({
      id: data.id,

      name: data.name,
      assembleUserId: data.assemble_user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
    const entity = User.partialBuilder(updateUserDto);

    const data = await this.prismaService.users.update({
      where: { id },
      data: entity.toDB,
      select: {
        id: true,

        name: true,
        assemble_user_id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });
    return new UserDto({
      id: data.id,

      name: data.name,
      assembleUserId: data.assemble_user_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prismaService.users.delete({
      where: { id },
    });
  }
}
