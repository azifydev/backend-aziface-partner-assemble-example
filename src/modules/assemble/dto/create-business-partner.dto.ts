import { ApiProperty } from '@nestjs/swagger';

import { Type } from 'class-transformer';
import { IsObject, IsOptional, IsString, IsUrl } from 'class-validator';

export class MaestroCredentialsDto {
  @IsString()
  @ApiProperty({
    description: 'The client ID for the Maestro system',
    example: 'maestro-client-id',
  })
  client_id: string;

  @IsString()
  @ApiProperty({
    description: 'The client secret for the Maestro system',
    example: 'maestro-client-secret',
  })
  client_secret: string;
}

export class AzifaceCredentialsDto {
  @IsString()
  @ApiProperty({
    description: 'The client ID for the Aziface system',
    example: 'aziface-client-id',
  })
  client_id: string;

  @IsString()
  @ApiProperty({
    description: 'The client secret for the Aziface system',
    example: 'aziface-client-secret',
  })
  client_secret: string;
}

export class WatchmanCredentialsDto {
  @IsString()
  @ApiProperty({
    description: 'The client ID for the Watchman service',
    example: 'watchman-client-id',
  })
  client_id: string;

  @IsString()
  @ApiProperty({
    description: 'The client secret for the Watchman service',
    example: 'watchman-client-secret',
  })
  client_secret: string;
}

export class CreateBusinessPartnerDto {
  @ApiProperty({
    description: 'The name of the business partner',
    example: 'Acme Corporation',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description:
      'The external ID for the business partner in the Maestro system',
    example: '12345',
  })
  @IsString()
  @IsOptional()
  externalIdMaestro?: string;

  @ApiProperty({
    description: 'Acceptance of terms and conditions',
    required: false,
  })
  @IsUrl()
  acceptanceTermsLinks: string;

  @ApiProperty({
    description: 'Unique identifier for the watchman partner',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsString()
  partnerIdWatchman: string;

  @ApiProperty({
    description:
      'The credentials for the business partner in the Maestro system',
  })
  @IsObject()
  @Type(() => MaestroCredentialsDto)
  credentialsMaestro: MaestroCredentialsDto;

  @ApiProperty({
    description:
      'The credentials for the business partner in the Aziface system',
  })
  @IsObject()
  @Type(() => AzifaceCredentialsDto)
  credentialsAziface: AzifaceCredentialsDto;
}
