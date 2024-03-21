import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentCompanyId = createParamDecorator((_, ctx: ExecutionContext): string | undefined => {
  const request = ctx.switchToHttp().getRequest();
  return request.headers['x-company-id'] as string;
});
