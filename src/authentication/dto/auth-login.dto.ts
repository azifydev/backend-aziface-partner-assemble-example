import { ApiProperty } from '@nestjs/swagger';

import { IsString, IsNotEmpty } from 'class-validator';

export class AuthLoginDto {
  @ApiProperty({
    description: 'User ID in the Assemble system',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: "User's password",
    example: 'minha-chave-secreta-123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}
