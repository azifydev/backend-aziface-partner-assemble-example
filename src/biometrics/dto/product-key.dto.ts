import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';
import { ResponseFromAssembleDto } from 'src/modules/assemble/dto/generic-error-maestro.dto';

export class ProductionKeyDto {
  @ApiProperty({
    description: 'Identificador do dispositivo',
    example: 'abc123XYZ987deviceToken',
  })
  @IsString()
  device: string;

  @ApiProperty({
    description: 'Chave de produção formatada',
    example:
      'appId      = myApp\nexpiryDate = 2026-01-01\nkey        = 0030450abcde...',
  })
  @IsString()
  productionKey: string;

  @ApiProperty({
    description: 'Chave pública em formato PEM',
    example:
      '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BA...\n-----END PUBLIC KEY-----',
  })
  @IsString()
  key: string;
}

export class ProductionKeyResponseDto extends ResponseFromAssembleDto {
  @ApiProperty({
    description: 'Data related to the biometric authentication token session',
    type: ProductionKeyDto,
  })
  @IsObject()
  data: ProductionKeyDto;
}
