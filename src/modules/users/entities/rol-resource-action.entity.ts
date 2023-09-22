import { Entity, Index, ManyToOne, PrimaryKey } from '@mikro-orm/core';
import { RolEntity }                            from '@modules/users/entities/rol.entity';
import { PermissionResourceEntity }             from '@modules/users/entities/permission/resource.entity';
import { PermissionActionEntity }               from '@modules/users/entities/permission/action.entity';

@Entity({tableName: 'rol_resource_action'})
@Index({properties: [ 'rol', 'resource', 'action' ]})
export class RolResourceActionEntity {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => RolEntity)
  rol: RolEntity;

  @ManyToOne(() => PermissionResourceEntity)
  resource: PermissionResourceEntity;

  @ManyToOne(() => PermissionActionEntity)
  action: PermissionActionEntity;

  constructor(rol: RolEntity, resource: PermissionResourceEntity, action: PermissionActionEntity) {
    this.rol = rol;
    this.resource = resource;
    this.action = action;
  }
}
