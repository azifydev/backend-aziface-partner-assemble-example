import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import type {
  RequestWithPartner,
  PartnerInfo,
} from '../guards/partner-api-key.guard';

/**
 * Parameter decorator to inject current partner information from the request
 *
 * This decorator extracts the partner information that was injected by the PartnerApiKeyGuard
 * and makes it available as a parameter in controller methods.
 *
 * @example
 * ```typescript
 * @Get('profile')
 * @UseGuards(PartnerApiKeyGuard)
 * getPartnerProfile(@CurrentPartner() partner: PartnerInfo) {
 *   return partner;
 * }
 * ```
 */
export const CurrentPartner = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): PartnerInfo => {
    const request = ctx.switchToHttp().getRequest<RequestWithPartner>();

    if (!request.partner) {
      throw new Error(
        'Partner information not found in request. Make sure PartnerApiKeyGuard is applied.',
      );
    }

    return request.partner;
  },
);
