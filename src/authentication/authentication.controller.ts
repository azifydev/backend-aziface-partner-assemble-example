import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { BadRequestDto } from 'src/common/dtos/bad-request.dto';
import { UnauthorizedRequestDto } from 'src/common/dtos/unauthorizated-request.dto';

import { AuthenticationService } from './authentication.service';
import { AuthLoginDto } from './dto/auth-login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';

export interface AuthenticatedUser {
  id: string;
  name?: string;
  external_id?: string;
}

@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @Post('login')
  @ApiTags('Authentication')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'User login with JWT token generation',
    description: 'Authenticates a user and returns a JWT access token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Bad request - Invalid input data',
    type: BadRequestDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Unauthorized - Invalid credentials',
    type: UnauthorizedRequestDto,
  })
  async login(@Body() authLoginDto: AuthLoginDto): Promise<AuthResponseDto> {
    return await this.authenticationService.login(authLoginDto);
  }
}
