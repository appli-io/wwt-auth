import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { FastifyRequest }                         from 'fastify';
import { CompanyUserEntity }                      from '@modules/company-user/entities/company-user.entity';

export const CurrentMember = createParamDecorator(
  (_, context: ExecutionContext): CompanyUserEntity | undefined => {
    return context.switchToHttp().getRequest<FastifyRequest>()?.member;
  },
);
