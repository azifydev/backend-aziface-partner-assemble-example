import { ApiProperty } from '@nestjs/swagger';

export class UnauthorizedRequestDto {
  @ApiProperty({
    description: 'Error message describing the unauthorized request',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code for the error',
    example: 401,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type or name',
    example: 'Unauthorized',
  })
  error: string;

  constructor(
    message: string = 'Unauthorized request',
    statusCode: number = 401,
    error: string = 'Unauthorized',
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
  }
}
