import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector }                                                     from '@nestjs/core';

import { Observable } from 'rxjs';

import { requiredRolesKey }   from '@modules/auth/decorators/requierd-role.decorator';
import { CompanyUserService } from '@modules/company-user/company-user.service';
import { RoleEnum }           from '@modules/company-user/enums/role.enum';
import { FastifyRequest }     from 'fastify';

@Injectable()
export class RolesGuard implements CanActivate {

  constructor(
    private _reflector: Reflector,
    private _companyUserService: CompanyUserService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const requiredRoles = this._reflector.get<RoleEnum[]>(requiredRolesKey, context.getHandler());

    // If no roles are required, allow access
    if (!requiredRoles) {
      return true;
    }

    const request: FastifyRequest = context.switchToHttp().getRequest<FastifyRequest>();
    const userId = request.user;
    const companyId = request.companyId;

    if (!userId || !companyId) {
      return false;
    }

    return this._companyUserService.getUserRole(companyId, userId, requiredRoles).then(roles => {
      return roles.some(role => requiredRoles.includes(role));
    }).catch(() => {
      throw new ForbiddenException('USER_NOT_ACTIVE');
    });
  }
}
