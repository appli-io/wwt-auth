import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector }                                                     from '@nestjs/core';

import { Observable } from 'rxjs';

import { memberUnneededKey }  from '@modules/auth/decorators/member-unneeded.decorator';
import { CompanyUserService } from '@modules/company-user/company-user.service';
import { RoleEnum }           from '@modules/company-user/enums/role.enum';
import { requiredRolesKey }   from '@modules/auth/decorators/requierd-role.decorator';

@Injectable()
export class MemberGuard implements CanActivate {
  constructor(
    private readonly _reflector: Reflector,
    private readonly _companyUserService: CompanyUserService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const memberUnneeded = this._reflector.get<boolean>(memberUnneededKey, context.getHandler());
    const requiredRoles = this._reflector.get<RoleEnum[]>(requiredRolesKey, context.getHandler());

    /**
     * If memberUnneeded is true, then no need to check if user is part of company
     * If requiredRoles is true, then check if user has the required roles bcs of the RolesGuard, that already checks user roles at company
     */
    if (memberUnneeded || requiredRoles) {
      return true; // if memberUnneeded or requiredRoles is true, then no need to check if user is part of company
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user as number;
    const companyId = request.headers['x-company-id'] as string;

    if (!userId || !companyId) {
      throw new ForbiddenException('Invalid permissions');
    }

    return this._companyUserService.isUserInCompany(companyId, userId);
  }
}
