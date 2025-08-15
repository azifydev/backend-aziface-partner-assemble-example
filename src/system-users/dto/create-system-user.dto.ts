import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsOptional } from 'class-validator';

export class CreateSystemUserDto {
  @ApiProperty({
    description: "User's name",
    example: 'João Silva',
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'External identifier of the user in other systems',
    example: 'external123',
    required: false,
  })
  @IsString()
  @IsOptional()
  externalId?: string;

  @ApiProperty({
    description: 'User name',
    example: 'johnDoe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'johnDoe',
  })
  @IsString()
  password: string;
}
