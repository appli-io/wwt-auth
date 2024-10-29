import { SetMetadata } from '@nestjs/common';
import { RoleEnum }    from '@modules/company-user/enums/role.enum';

export const requiredRolesKey = 'requiredRoles';

export const RequiredRole = (...roles: RoleEnum[]) => SetMetadata(requiredRolesKey, roles);
