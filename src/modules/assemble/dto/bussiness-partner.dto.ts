import { ApiProperty } from '@nestjs/swagger';

import {
  DeepNullable,
  DeepPartial,
} from 'src/common/types/deep-partial-object';
import { AzifaceCredentialsDto, MaestroCredentialsDto } from './create-business-partner.dto';


/**
 * Data Transfer Object representing a business partner.
 *
 * @remarks
 * This DTO is used to transfer business partner data between different layers of the application.
 * It includes metadata such as unique identifier, name, external Maestro id, creation and update timestamps,
 * and an optional deletion timestamp.
 *
 * @property id - Unique identifier for the business partner (UUID).
 * @property name - Name of the business partner.
 * @property externalIdMaestro - External identifier of the partner in the Maestro system.
 * @property createdAt - Timestamp when the partner was created.
 * @property updatedAt - Timestamp when the partner was last updated.
 * @property deletedAt - If null, the partner is not deleted; otherwise, it is the timestamp when the partner was deleted.
 *
 * @constructor
 * Creates a new instance of BusinessPartnerDto, optionally assigning properties from a partial or nullable object.
 */

export class BusinessPartnerDto {
  @ApiProperty({
    description: 'Unique identifier for the business partner',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the business partner',
    example: 'ABC Corporation',
  })
  name: string;

  @ApiProperty({
    description: 'External identifier of the partner in the Maestro system',
    example: 'maestro-123',
  })
  externalIdMaestro: string;

  @ApiProperty({
    description:
      'The credentials for the business partner in the Maestro system',
  })
  credentialsMaestro: MaestroCredentialsDto;

  @ApiProperty({
    description:
      'The credentials for the business partner in the Maestro system',
  })
  credentialsAziface: AzifaceCredentialsDto;

  @ApiProperty({
    description: 'Unique identifier for the watchman partner',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  partnerIdWatchman: string;

  @ApiProperty({
    description: 'Timestamp when the partner was created',
    example: '2023-10-01T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the partner was last updated',
    example: '2023-10-01T12:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description:
      'If null the partner is not deleted, otherwise it is the timestamp when the partner was deleted',
    example: null,
    required: false,
  })
  deletedAt?: Date;

  constructor(
    partial: DeepNullable<BusinessPartnerDto> | DeepPartial<BusinessPartnerDto>,
  ) {
    Object.assign(this, partial);
  }
}

export class CreateBusinessPartnerResponseDto extends BusinessPartnerDto {
  @ApiProperty({
    description:
      'Unique identifier for group access associated with the business partner',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  groupId: string;
}
