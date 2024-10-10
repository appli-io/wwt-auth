import { FastifyRequest as Request } from 'fastify';
import { CompanyUserEntity }         from '@modules/company-user/entities/company-user.entity';

declare module 'fastify' {
  interface FastifyRequest extends Request {
    user?: string;
    companyId: string;
    member?: CompanyUserEntity;
  }
}
