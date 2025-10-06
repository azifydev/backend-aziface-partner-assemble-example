import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { AuthenticationService } from 'src/authentication/authentication.service';

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService, AuthenticationService],
  exports: [UsersService],
})
export class UsersModule {}
