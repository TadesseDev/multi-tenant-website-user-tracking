import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Role } from '@prisma/client';

export interface CurrentUserPayload {
  sub: string;
  tenantId: string;
  role: Role;
  type: string;
}

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { user: CurrentUserPayload }>();
    return request.user;
  },
);
