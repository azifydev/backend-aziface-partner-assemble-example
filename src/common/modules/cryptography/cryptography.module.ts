import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import {
  AesService,
  ConfigKeyProviderService,
  CryptoProviderService,
  ICryptoProvider,
  IKeyProvider,
} from './aes.service';

const providers = [
  AesService,
  {
    provide: IKeyProvider,
    useClass: ConfigKeyProviderService,
  },
  {
    provide: ICryptoProvider,
    useClass: CryptoProviderService,
  },
];

@Global()
@Module({
  imports: [ConfigModule],
  providers,
  exports: providers,
})
export class CryptographyModule {}
