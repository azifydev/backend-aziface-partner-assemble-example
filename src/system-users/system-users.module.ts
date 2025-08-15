import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { SystemUsersController } from './system-users.controller';
import { SystemUsersService } from './system-users.service';
import { AuthenticationService } from 'src/authentication/authentication.service';

@Module({
  imports: [PrismaModule],
  controllers: [SystemUsersController],
  providers: [SystemUsersService, AuthenticationService],
  exports: [SystemUsersService],
})
export class SystemUsersModule {}
