import { ApiProperty } from '@nestjs/swagger';

const internalServerErrorMessage = 'Internal Server Error';

export class InternalServerErrorDto {
  @ApiProperty({
    description: 'Error message describing the internal server error',
    example: internalServerErrorMessage,
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code for the error',
    example: 500,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type or name',
    example: internalServerErrorMessage,
  })
  error: string;

  constructor(
    message: string = internalServerErrorMessage,
    statusCode: number = 500,
    error: string = internalServerErrorMessage,
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
  }
}
