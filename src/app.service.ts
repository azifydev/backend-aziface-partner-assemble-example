import { Inject, Injectable } from '@nestjs/common';

import { Logger } from 'nestjs-pino';

@Injectable()
export class AppService {
  public constructor(@Inject(Logger) private readonly logger: Logger) {}
  getHello(): string {
    return 'Hello World!!';
  }
}
