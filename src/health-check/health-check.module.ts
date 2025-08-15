import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health-check.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
})
export class HealthCheckModule {}
