import { Module } from '@nestjs/common';

import { PrismaModule } from 'src/prisma/prisma.module';

import { BiometricsController } from './biometrics.controller';
import { AssembleModule } from 'src/modules/assemble/assemble.module';

@Module({
  imports: [PrismaModule, AssembleModule],
  controllers: [BiometricsController],
  providers: [],
  exports: [],
})
export class BiometricsModule {}
