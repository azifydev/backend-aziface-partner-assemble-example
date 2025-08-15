import { UnauthorizedException } from '@nestjs/common';

import type { PartnerInfo } from 'src/authentication/guards/partner-api-key.guard';
import type { BusinessPartnerDto } from 'src/business-partners/dto/bussiness-partner.dto';

export function getCredentialsMaestro(
  partner: BusinessPartnerDto | PartnerInfo,
): {
  client_id: string;
  client_secret: string;
} {
  if (isBusinessPartnerDto(partner)) {
    return {
      client_id: partner.credentialsMaestro.client_id,
      client_secret: partner.credentialsMaestro.client_secret,
    };
  }

  if (isPartnerInfo(partner)) {
    return {
      client_id: partner.credentials_maestro.client_id,
      client_secret: partner.credentials_maestro.client_secret,
    };
  }

  throw new UnauthorizedException('Credentials Maestro not found');
}

function isBusinessPartnerDto(partner: unknown): partner is BusinessPartnerDto {
  return (
    typeof partner === 'object' &&
    partner !== null &&
    'credentialsMaestro' in partner &&
    partner.credentialsMaestro !== undefined
  );
}

function isPartnerInfo(partner: unknown): partner is PartnerInfo {
  return (
    typeof partner === 'object' &&
    partner !== null &&
    'credentials_maestro' in partner &&
    partner.credentials_maestro !== undefined
  );
}
