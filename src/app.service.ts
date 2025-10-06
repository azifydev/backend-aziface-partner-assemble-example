import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  public constructor() {}

  getHello(): string {
    return 'Welcome Backend Aziface Partner Assemble Example API. 📘 Documentation: http://localhost:60000/api-docs#/';
  }
}
