import { Controller, Get, Render } from '@nestjs/common';

@Controller('panel')
export class PanelController {
  @Get()
  @Render('index') // renders views/home.twig
  getPanel() {
    return {
      title: 'Twig in NestJS',
      message: 'Hello from Twig!',
    };
  }
}
