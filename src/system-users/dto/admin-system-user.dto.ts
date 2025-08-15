import { ApiProperty } from '@nestjs/swagger';

/**
 * Data Transfer Object representing admin system user information.
 *
 * This DTO is used to return information about system users who have
 * WISIEX_BANK_SYSTEM_ADMIN permissions, including their group and partner details.
 *
 * @property userId - Unique identifier for the system user (UUID).
 * @property userName - Name of the user.
 * @property groupId - Unique identifier for the bank users group (UUID).
 * @property groupName - Name of the bank users group.
 * @property partnerId - Unique identifier for the business partner (UUID).
 * @property partnerName - Name of the business partner.
 */
export class AdminSystemUserDto {
  @ApiProperty({
    description: 'Unique identifier for the system user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  public readonly userId: string;

  @ApiProperty({
    description: 'Name of the user',
    example: 'John Doe',
  })
  public readonly userName: string;

  @ApiProperty({
    description: 'Unique identifier for the bank users group',
    example: '987e6543-e21b-34c5-a678-901234567890',
  })
  public readonly groupId: string;

  @ApiProperty({
    description: 'Name of the bank users group',
    example: 'WISIEX_BANK_SYSTEM_ADMIN',
  })
  public readonly groupName: string;

  @ApiProperty({
    description: 'Unique identifier for the business partner',
    example: '456e7890-e12b-23d4-a567-890123456789',
  })
  public readonly partnerId: string;

  @ApiProperty({
    description: 'Name of the business partner',
    example: 'Example Bank',
  })
  public readonly partnerName: string;

  constructor(data: {
    userId: string;
    userName: string;
    groupId: string;
    groupName: string;
    partnerId: string;
    partnerName: string;
  }) {
    this.userId = data.userId;
    this.userName = data.userName;
    this.groupId = data.groupId;
    this.groupName = data.groupName;
    this.partnerId = data.partnerId;
    this.partnerName = data.partnerName;
  }
}
