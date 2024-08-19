import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector }                                                     from '@nestjs/core';

import { Observable } from 'rxjs';

import { memberUnneededKey }  from '@modules/auth/decorators/member-unneeded.decorator';
import { CompanyUserService } from '@modules/company-user/company-user.service';
import { FastifyRequest }     from 'fastify';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly _companyUserService: CompanyUserService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const memberUnneeded = this._reflector.get<boolean>(memberUnneededKey, context.getHandler());

    /**
     * If memberUnneeded is true, then no need to check if user is part of company
     */
    if (memberUnneeded) {
      return true; // if memberUnneeded or requiredRoles is true, then no need to check if user is part of company
    }

    const request: FastifyRequest = context.switchToHttp().getRequest<FastifyRequest>();
    const userId = request.user;
    const companyId = request.companyId;

    return this._companyUserService.findOne(userId, companyId)
      .then((member) => {
        console.log('member', member);
        if (!member) throw new ForbiddenException('USER_NOT_MEMBER');
        if (!member.isActive) throw new ForbiddenException('USER_NOT_ACTIVE');

        // save the member at the request
        request.member = member;

        return true;
      });
  }
}
