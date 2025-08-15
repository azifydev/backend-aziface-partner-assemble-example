import { Module } from '@nestjs/common';

import { HttpClientModule } from 'src/http-client/http-client.module';

import { AssembleService } from './services/assemble.service';
import { AssembleBiometricService } from './services/assemble-biometric.service';

@Module({
  imports: [HttpClientModule],
  providers: [
    // Services
    AssembleService,
    AssembleBiometricService,
  ],
  exports: [AssembleService, AssembleBiometricService],
})
export class AssembleModule {}
