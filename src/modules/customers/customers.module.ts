import { Module } from '@nestjs/common';

import { BankUserService } from 'src/bank-users/bank-user.service';
import { BankUsersGroupsService } from 'src/bank-users-groups/bank-users-groups.service';
import { PrismaModule } from 'src/prisma/prisma.module';

import { MaestroModule } from '../assemble/assemble.module';
import { WatchmanModule } from '../watchman/watchman.module';

import { CustomersController } from './controllers/customers.controller';
import { CustomersService } from './services/customers.service';

@Module({
  imports: [PrismaModule, WatchmanModule, MaestroModule],
  controllers: [CustomersController],
  providers: [
    // Services
    CustomersService,
    BankUsersGroupsService,
    BankUserService,
  ],
})
export class CustomersModule {}
