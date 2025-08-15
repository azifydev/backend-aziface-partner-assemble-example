import { ApiProperty } from '@nestjs/swagger';

export class ForbiddenRequestDto {
  @ApiProperty({
    description: 'Error message describing the forbidden request',
    example: 'You do not have permission to access this resource',
  })
  message: string;

  @ApiProperty({
    description: 'HTTP status code for the error',
    example: 403,
  })
  statusCode: number;

  @ApiProperty({
    description: 'Error type or name',
    example: 'Forbidden',
  })
  error: string;

  constructor(
    message: string = 'Forbidden request',
    statusCode: number = 403,
    error: string = 'Forbidden',
  ) {
    this.message = message;
    this.statusCode = statusCode;
    this.error = error;
  }
}
