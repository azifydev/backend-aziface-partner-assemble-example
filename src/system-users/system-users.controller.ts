import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiHeader,
  ApiSecurity,
} from '@nestjs/swagger';

import { ApiKeyGuard } from 'src/authentication/guards/api-key.guard';
import { BadRequestDto } from 'src/common/dtos/bad-request.dto';
import { ForbiddenRequestDto } from 'src/common/dtos/forbidden-request.dto';
import { UnauthorizedRequestDto } from 'src/common/dtos/unauthorizated-request.dto';

import { CreateSystemUserDto } from './dto/create-system-user.dto';
import { SystemUserDto } from './dto/system-user.dto';
import { UpdateSystemUserDto } from './dto/update-system-user.dto';
import { SystemUsersService } from './system-users.service';

@ApiSecurity('x-api-key-partner')
@ApiTags('System Users')
@UseGuards(ApiKeyGuard)
@Controller('system-users')
export class SystemUsersController {
  constructor(private readonly systemUsersService: SystemUsersService) {}

  @ApiOperation({
    summary: 'Create a new system user',
    description:
      'Creates a new system user with the provided data. Returns the created user with all its details.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created. Returns the created user data.',
    type: SystemUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description:
      'Bad request. The provided data is invalid or missing required fields.',
    type: BadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized request. The user is not authenticated.',
    type: UnauthorizedRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description:
      'Forbidden. The user does not have permission to perform this action.',
    type: ForbiddenRequestDto,
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Partner api key',
    required: true,
    example: 'd41d8cd98f00b204e9800998ecf8427e',
  })
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createSystemUserDto: CreateSystemUserDto,
  ): Promise<SystemUserDto> {
    try {
      return await this.systemUsersService.create(createSystemUserDto);
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao criar usuário',
      });
    }
  }

  @ApiOperation({
    summary: 'List all system users',
    description:
      'Returns a list of all system users that have not been soft deleted.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users successfully returned.',
    type: SystemUserDto,
    isArray: true,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request when listing users.',
    type: BadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized request when listing users.',
    type: UnauthorizedRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden access when listing users.',
    type: ForbiddenRequestDto,
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Partner api key',
    required: true,
    example: 'd41d8cd98f00b204e9800998ecf8427e',
  })
  @Get()
  async findAll(): Promise<SystemUserDto[]> {
    try {
      return await this.systemUsersService.findAll();
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao listar usuários',
      });
    }
  }

  @ApiOperation({
    summary: 'Get a system user by ID',
    description:
      'Fetches and returns the details of a system user by its unique identifier (UUID).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found and returned successfully.',
    type: SystemUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request when fetching user.',
    type: BadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized request when fetching user.',
    type: UnauthorizedRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden access when fetching user.',
    type: ForbiddenRequestDto,
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Partner api key',
    required: true,
    example: 'd41d8cd98f00b204e9800998ecf8427e',
  })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<SystemUserDto | null> {
    try {
      return await this.systemUsersService.findOne(id);
    } catch (error: any) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao buscar usuário',
      });
    }
  }

  @ApiOperation({
    summary: 'Update a system user by ID',
    description:
      'Updates the details of a system user identified by its UUID. Returns the updated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully updated.',
    type: SystemUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request when updating user.',
    type: BadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized request when updating user.',
    type: UnauthorizedRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden access when updating user.',
    type: ForbiddenRequestDto,
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Partner api key',
    required: true,
    example: 'd41d8cd98f00b204e9800998ecf8427e',
  })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSystemUserDto: UpdateSystemUserDto,
  ): Promise<SystemUserDto> {
    try {
      return await this.systemUsersService.update(id, updateSystemUserDto);
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao atualizar usuário',
      });
    }
  }

  @ApiOperation({
    summary: 'Soft delete a system user by ID',
    description:
      'Performs a soft delete on a system user by its UUID. The user is not removed from the database, only marked as deleted.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully soft deleted.',
    type: SystemUserDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request when removing user.',
    type: BadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized request when removing user.',
    type: UnauthorizedRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Forbidden access when removing user.',
    type: ForbiddenRequestDto,
  })
  @ApiHeader({
    name: 'x-api-key',
    description: 'Partner api key',
    required: true,
    example: 'd41d8cd98f00b204e9800998ecf8427e',
  })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<void> {
    try {
      await this.systemUsersService.remove(id);
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao remover usuário',
      });
    }
  }
}
