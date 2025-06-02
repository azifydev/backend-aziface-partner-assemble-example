import { Module } from '@nestjs/common';
import { UserModule } from './modules/user/user.module';
import { PanelModule } from './modules/panel/panel.module';
import { SharedModule } from './shared/shared.module';

@Module({
  imports: [SharedModule, UserModule, PanelModule],
})
export class AppModule {}