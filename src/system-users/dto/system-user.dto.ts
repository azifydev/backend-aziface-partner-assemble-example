import { ApiProperty } from '@nestjs/swagger';

import {
  DeepNullable,
  DeepPartial,
} from 'src/common/types/deep-partial-object';

/**
 * Data Transfer Object representing a system user.
 *
 * @remarks
 * This DTO is used to transfer system user data between different layers of the application.
 * It includes metadata such as unique identifier, type, name, external id, creation and update timestamps,
 * and an optional deletion timestamp.
 *
 * @property id - Unique identifier for the system user (UUID).
 * @property type - Type of the user: 'CUSTOMER' or 'EMPLOYEE'.
 * @property name - Name of the user.
 * @property externalId - External identifier of the user in other systems.
 * @property createdAt - Timestamp when the user was created.
 * @property updatedAt - Timestamp when the user was last updated.
 * @property deletedAt - If null, the user is not deleted; otherwise, it is the timestamp when the user was deleted.
 *
 * @constructor
 * Creates a new instance of SystemUserDto, optionally assigning properties from a partial or nullable object.
 */
export class SystemUserDto {
  @ApiProperty({
    description: 'Unique identifier for the system user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
    required: false,
  })
  name?: string;

  @ApiProperty({
    description: 'External identifier of the user in other systems',
    example: 'external-123',
    required: false,
  })
  externalId?: string;

  @ApiProperty({
    description: 'Timestamp when the user was created',
    example: '2023-10-01T12:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the user was last updated',
    example: '2023-10-01T12:00:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description:
      'If null the user is not deleted, otherwise it is the timestamp when the user was deleted',
    example: null,
    required: false,
  })
  deletedAt?: Date;

  constructor(
    partial: DeepNullable<SystemUserDto> | DeepPartial<SystemUserDto>,
  ) {
    Object.assign(this, partial);
  }
}
