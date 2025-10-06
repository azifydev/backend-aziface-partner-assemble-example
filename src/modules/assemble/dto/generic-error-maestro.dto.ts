import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JsonObject } from '@prisma/client/runtime/library';

import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class ResponseFromAssembleDto {
  @ApiPropertyOptional({
    enum: HttpStatus,
    description: 'Error code',
    example: HttpStatus.OK,
  })
  @IsOptional()
  @IsEnum(HttpStatus)
  status?: string | null;

  @ApiPropertyOptional({
    description: 'Erro retornado pela API, se houver',
    example: null,
  })
  @IsOptional()
  error?: JsonObject | null;

  @ApiPropertyOptional({
    description: 'Error message',
    example: 'The provided Pix key is invalid.',
  })
  @IsOptional()
  @IsString()
  message?: string | null;
}

export class BiometricAuthTokenSessionDataDto {
  @ApiProperty({
    description: 'Token for biometric authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  token: string;

  @ApiProperty({
    description: 'Process ID for biometric',
    example: 'b3e1c2d4-5f67-4a89-8e12-3f4b5c6d7e8f',
  })
  @IsUUID()
  processId: string;
}

export class BiometricProcessDataDto {
  @ApiPropertyOptional({
    description: 'Process ID for biometric',
    example: '1234-5678-9012-345678901234',
  })
  @IsOptional()
  @IsString()
  processId?: string | null;
}

export class BiometricAuthTokenSessionDto extends ResponseFromAssembleDto {
  @ApiProperty({
    description: 'Data related to the biometric authentication token session',
    type: BiometricAuthTokenSessionDataDto,
  })
  @IsObject()
  data: BiometricAuthTokenSessionDataDto;
}

export class BiometricProcessDto extends ResponseFromAssembleDto {
  @ApiProperty({
    description: 'Data related to the biometric authentication token session',
    type: BiometricProcessDataDto,
  })
  @IsObject()
  data: BiometricProcessDataDto;
}
