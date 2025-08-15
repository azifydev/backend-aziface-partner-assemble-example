import { type ExecutionContext, createParamDecorator } from '@nestjs/common';

import type { AuthenticatedUser } from '../authentication.controller';

export const CurrentUserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
