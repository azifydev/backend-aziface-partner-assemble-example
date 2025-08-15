import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

import type { HttpErrorResponse } from 'src/http-client/http-client.service';

export function handleHttpClientError(error: HttpErrorResponse): never {
  const { status, data } = error;
  const message: Record<string, any> = {
    message: 'Erro desconhecido',
    status,
  };
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (data && data.message) {
    message.message = JSON.stringify(data.message) || 'Erro desconhecido';

    if (data.statusCode) {
      message.code = data.statusCode;
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  } else if (data && data.messages) {
    message.message = JSON.stringify(data.messages) || 'Erro desconhecido';
  }

  switch (status) {
    case 400:
      throw new BadRequestException(message);
    case 401:
      throw new UnauthorizedException(message);
    case 403:
      throw new ForbiddenException(message);
    case 404:
      throw new NotFoundException(message);
    case 500:
      throw new InternalServerErrorException(message);
    default:
      throw new HttpException(message, status || 500);
  }
}
