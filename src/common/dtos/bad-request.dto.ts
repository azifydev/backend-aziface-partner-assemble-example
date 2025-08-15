import { ApiProperty } from '@nestjs/swagger';

export class BadRequestDto {
  @ApiProperty({
    description: 'Error message describing the bad request',
    example: 'Invalid input data',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code for the error',
    example: 400,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type or name',
    example: 'Bad Request',
  })
  error: string;

  constructor(
    message: string,
    statusCode: number = 400,
    error: string = 'Bad Request',
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
  }
}
