import { SetMetadata } from '@nestjs/common';

export const requiredRolesKey = 'requiredRoles';

export const RequiredRole = (...roles: string[]) => SetMetadata(requiredRolesKey, roles);
