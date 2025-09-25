import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  BadRequestException,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiTags,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { BadRequestDto } from 'src/common/dtos/bad-request.dto';
import { ForbiddenRequestDto } from 'src/common/dtos/forbidden-request.dto';
import { UnauthorizedRequestDto } from 'src/common/dtos/unauthorizated-request.dto';

import { JwtAuthGuard } from 'src/authentication/guards/jwt-auth.guard';
import { CurrentUserId } from 'src/authentication/decorators/current-user.decorator';
import { AuthenticatedUser } from 'src/authentication/authentication.controller';
import { AssembleService } from 'src/modules/assemble/services/assemble.service';
import { BiometricAuthTokenSessionDataDto } from 'src/modules/assemble/dto/generic-error-maestro.dto';
import { ProductionKeyDto } from './dto/product-key.dto';

const BAD_REQUEST = 'Bad Request';
const FORBIDDEN = 'Forbidden';
const NOT_FOUND = 'Not Found';
const INTERNAL_SERVER_ERROR = 'Internal Server Error';

@ApiTags('Biometrics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('biometrics')
export class BiometricsController {
  constructor(private readonly assembleService: AssembleService) {}

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
  @Post('session')
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

  @Get('configs')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get Config' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Config retrieved successfully',
    type: ProductionKeyDto,
  })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: BAD_REQUEST })
  @ApiResponse({ status: HttpStatus.FORBIDDEN, description: FORBIDDEN })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: NOT_FOUND })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: INTERNAL_SERVER_ERROR,
  })
  async retrieveConfig(
    @CurrentUserId() user: AuthenticatedUser,
  ): Promise<ProductionKeyDto> {
    return await this.assembleService.retrieveConfig(user);
  }
}
