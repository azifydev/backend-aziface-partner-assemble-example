import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';

import { BadRequestDto } from 'src/common/dtos/bad-request.dto';
import { ForbiddenRequestDto } from 'src/common/dtos/forbidden-request.dto';
import { UnauthorizedRequestDto } from 'src/common/dtos/unauthorizated-request.dto';

import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/authentication/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/authentication/authentication.controller';
import { AssembleService } from 'src/modules/assemble/services/assemble.service';
import {
  BiometricAuthTokenSessionDataDto,
  BiometricProcessDataDto,
} from 'src/modules/assemble/dto/generic-error-maestro.dto';

@ApiTags('Biometrics')
@UseGuards(JwtAuthGuard)
@Controller('biometrics')
export class BiometricsController {
  constructor(private readonly assembleService: AssembleService) {}

  @ApiOperation({
    summary: 'Creates a new biometric id',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description:
      'Process biometric successfully created. Returns the created process data.',
    type: BiometricProcessDataDto,
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
  @Post('biometric-auth')
  @HttpCode(HttpStatus.OK)
  async createProcess(
    @CurrentUserId() user: AuthenticatedUser,
  ): Promise<BiometricProcessDataDto> {
    try {
      return await this.assembleService.createProcess(user);
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao criar usuário',
      });
    }
  }

  @ApiOperation({
    summary: 'Create a new biometric token session',
    description: 'Creates a new token for biometric authentication process.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Token successfully created. Returns the created token data.',
    type: BiometricAuthTokenSessionDataDto,
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
  @Post('biometric-auth/session')
  @HttpCode(HttpStatus.OK)
  async createTokenSession(
    @CurrentUserId() user: AuthenticatedUser,
  ): Promise<BiometricAuthTokenSessionDataDto> {
    try {
      return await this.assembleService.createTokenSession(user);
    } catch (error) {
      const err = error as Error;
      throw new BadRequestException(err.name, {
        description: err.message || 'Erro ao criar usuário',
      });
    }
  }
}
