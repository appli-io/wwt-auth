import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { FastifyRequest }                                             from 'fastify';

export const CurrentCompanyId = createParamDecorator((_, ctx: ExecutionContext): string | undefined => {
  const request: FastifyRequest = ctx.switchToHttp().getRequest<FastifyRequest>();

  if (!request.companyId)
    throw new ForbiddenException();

  return request.companyId;
});
