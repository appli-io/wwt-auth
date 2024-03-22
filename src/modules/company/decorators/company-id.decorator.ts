import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { isUUID }                                                      from 'class-validator';

export const CurrentCompanyId = createParamDecorator((_, ctx: ExecutionContext): string | undefined => {
  const request = ctx.switchToHttp().getRequest();

  if (!request.headers['x-company-id'])
    throw new BadRequestException('x-company-id header is required');

  if (!isUUID(request.headers['x-company-id']))
    throw new BadRequestException('x-company-id header is not a valid uuid');

  return request.headers['x-company-id'] as string;
});
