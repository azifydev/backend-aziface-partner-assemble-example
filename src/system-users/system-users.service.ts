import { BadRequestException, Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { SystemUserDto } from './dto/system-user.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { SystemUser } from './entities/system-user.entity';
import { AuthenticationService } from 'src/authentication/authentication.service';

@Injectable()
export class SystemUsersService {
  public constructor(
    private readonly prismaService: PrismaService,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async create(
    createSystemUserDto: CreateSystemUserDto,
  ): Promise<SystemUserDto> {
    const authentication = await this.prismaService.authentication.findFirst({
      where: {
        username: createSystemUserDto.username,
      },
    });

    if (authentication) {
      throw new BadRequestException('Username is already in use');
    }

    const data = await this.prismaService.system_users.create({
      data: {
        name: createSystemUserDto.name,
      },
      select: {
        id: true,

        name: true,
        external_id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });

    await this.authenticationService.createAuthentication({
      userId: data.id,
      username: createSystemUserDto.username,
      password: createSystemUserDto.password,
    });

    return new SystemUserDto({
      id: data.id,

      name: data.name,
      externalId: data.external_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    });
  }

  async findAll(): Promise<SystemUserDto[]> {
    const data = await this.prismaService.system_users.findMany({
      select: {
        id: true,

        name: true,
        external_id: true,
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
        new SystemUserDto({
          id: item.id,

          name: item.name,
          externalId: item.external_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          deletedAt: item.deleted_at,
        }),
    );
  }

  async findOne(id: string): Promise<SystemUserDto | null> {
    const data = await this.prismaService.system_users.findUnique({
      where: { id },
      select: {
        id: true,

        name: true,
        external_id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });
    if (!data) return null;
    return new SystemUserDto({
      id: data.id,

      name: data.name,
      externalId: data.external_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    });
  }

  async update(
    id: string,
    updateSystemUserDto: UpdateSystemUserDto,
  ): Promise<SystemUserDto> {
    const entity = SystemUser.partialBuilder(updateSystemUserDto);

    const data = await this.prismaService.system_users.update({
      where: { id },
      data: entity.toDB,
      select: {
        id: true,

        name: true,
        external_id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });
    return new SystemUserDto({
      id: data.id,

      name: data.name,
      externalId: data.external_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    });
  }

  async remove(id: string): Promise<SystemUserDto> {
    const data = await this.prismaService.system_users.update({
      where: { id },
      data: { deleted_at: new Date() },
      select: {
        id: true,

        name: true,
        external_id: true,
        created_at: true,
        updated_at: true,
        deleted_at: true,
      },
    });
    return new SystemUserDto({
      id: data.id,

      name: data.name,
      externalId: data.external_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      deletedAt: data.deleted_at,
    });
  }
}
