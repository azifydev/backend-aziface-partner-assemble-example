import { Controller, Get } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Get Hello World',
    description: 'Returns a simple hello world message',
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
