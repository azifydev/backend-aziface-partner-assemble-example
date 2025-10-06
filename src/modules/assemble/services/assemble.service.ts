import { Injectable } from '@nestjs/common';

import { AssembleBiometricService } from './assemble-biometric.service';
import { AuthenticatedUser } from 'src/authentication/authentication.controller';
import {
  BiometricAuthTokenSessionDataDto,
  BiometricProcessDataDto,
} from '../dto/generic-error-maestro.dto';
import { ProductionKeyDto } from 'src/biometrics/dto/product-key.dto';

@Injectable()
export class AssembleService {
  constructor(
    private readonly assembleBiometricService: AssembleBiometricService,
  ) {}

  async createTokenSession(
    user: AuthenticatedUser,
  ): Promise<BiometricAuthTokenSessionDataDto> {
    return await this.assembleBiometricService.createTokenSession(user);
  }

  async createProcess(
    user: AuthenticatedUser,
  ): Promise<BiometricProcessDataDto> {
    return await this.assembleBiometricService.createProcess(user);
  }

  async retrieveConfig(user: AuthenticatedUser): Promise<ProductionKeyDto> {
    return await this.assembleBiometricService.retrieveConfig(user);
  }
}
