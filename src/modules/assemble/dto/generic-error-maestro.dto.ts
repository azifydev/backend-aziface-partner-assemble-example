import { HttpStatus } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { JsonObject } from '@prisma/client/runtime/library';

import { IsEnum, IsObject, IsOptional, IsString } from 'class-validator';

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
  @ApiPropertyOptional({
    description: 'Token for biometric authentication',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsOptional()
  @IsString()
  token?: string | null;
}

export class BiometricProcessDataDto {
  @ApiPropertyOptional({
    description: 'Process ID for biometric',
    example: '1234-5678-9012-345678901234',
  })
  @IsOptional()
  @IsString()
  process?: string | null;
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
