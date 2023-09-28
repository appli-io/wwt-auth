import { Module }         from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { RolResourceActionEntity }  from '@modules/permissions/entities/rol-resource-action.entity';
import { RolEntity }                from '@modules/users/entities/rol.entity';
import { PermissionResourceEntity } from '@modules/permissions/entities/resource.entity';
import { PermissionActionEntity }   from '@modules/permissions/entities/action.entity';
import { PermissionsService }       from '@modules/permissions/permissions.service';
import { ResourceActionEntity }     from '@modules/permissions/entities/resource-action.entity';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      PermissionActionEntity,
      PermissionResourceEntity,
      ResourceActionEntity,
      RolEntity,
      RolResourceActionEntity,
    ]),
  ],
  providers: [
    PermissionsService
  ],
})
export class PermissionsModule {
}
