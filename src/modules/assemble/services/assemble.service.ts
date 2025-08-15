import { Injectable } from '@nestjs/common';

import { AssembleBiometricService } from './assemble-biometric.service';
import { AuthenticatedUser } from 'src/authentication/authentication.controller';
import { BiometricAuthTokenSessionDataDto } from '../dto/generic-error-maestro.dto';

@Injectable()
export class AssembleService {
  constructor(
    private readonly assembleBiometricService: AssembleBiometricService,
  ) {}

  async createProcess(
    user: AuthenticatedUser,
  ): Promise<BiometricAuthTokenSessionDataDto> {
    return await this.assembleBiometricService.createProcess(user);
  }
}
