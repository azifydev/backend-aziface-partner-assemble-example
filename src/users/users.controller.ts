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

import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiSecurity('x-api-key-partner')
@ApiTags('Users')
@UseGuards(ApiKeyGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({
    summary: 'Create a new user',
    description:
      'Creates a new user with the provided data. Returns the created user with all its details.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'User successfully created. Returns the created user data.',
    type: UserDto,
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
  @HttpCode(HttpStatus.OK)
  async create(@Body() createUserDto: CreateUserDto): Promise<UserDto> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao criar usuário',
      });
    }
  }

  @ApiOperation({
    summary: 'List all users',
    description: 'Returns a list of all users.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of users successfully returned.',
    type: UserDto,
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
  async findAll(): Promise<UserDto[]> {
    try {
      return await this.usersService.findAll();
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao listar usuários',
      });
    }
  }

  @ApiOperation({
    summary: 'Get a user by ID',
    description:
      'Fetches and returns the details of a user by its unique identifier (UUID).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User found and returned successfully.',
    type: UserDto,
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
  async findOne(@Param('id') id: string): Promise<UserDto | null> {
    try {
      return await this.usersService.findOne(id);
    } catch (error: any) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao buscar usuário',
      });
    }
  }

  @ApiOperation({
    summary: 'Update a user by ID',
    description:
      'Updates the details of a user identified by its UUID. Returns the updated user.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User successfully updated.',
    type: UserDto,
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
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserDto> {
    try {
      return await this.usersService.update(id, updateUserDto);
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao atualizar usuário',
      });
    }
  }

  @ApiOperation({
    summary: 'Delete a user by ID',
    description:
      'Performs a delete on a user by its UUID. The user is not removed from the database, only marked as deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User successfully deleted.',
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
      await this.usersService.remove(id);
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao remover usuário',
      });
    }
  }
}
