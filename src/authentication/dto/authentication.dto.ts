import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class AuthenticationDto {
  @ApiProperty({
    description: 'User name',
    example: 'johnDoe',
  })
  @IsString()
  username: string;

  @ApiProperty({
    description: "User'id in the system",
    example: 'johnDoe',
  })
  @IsUUID()
  userId: string;

  @ApiProperty({
    description: 'Hashed secret for the user authentication',
    example: 'password',
  })
  password: string;
}
