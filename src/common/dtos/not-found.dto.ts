import { ApiProperty } from '@nestjs/swagger';

export class NotFoundDto {
  @ApiProperty({
    description: 'Error message describing the not found resource',
    example: 'Resource not found',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code for the error',
    example: 404,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type or name',
    example: 'Not Found',
  })
  error: string;

  constructor(
    message: string = 'Resource not found',
    statusCode: number = 404,
    error: string = 'Not Found',
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
  }
}
