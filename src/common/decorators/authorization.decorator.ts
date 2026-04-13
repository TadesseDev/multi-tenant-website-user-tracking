import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const authHeader = createParamDecorator((_, ctx: ExecutionContext) => {
  const request: { headers: { authorization: string } } = ctx
    .switchToHttp()
    .getRequest();
  return request.headers.authorization;
});
