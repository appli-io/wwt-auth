import { Entity, Index, ManyToOne, PrimaryKey, Unique } from '@mikro-orm/core';
import { PermissionResourceEntity }                     from '@modules/permissions/entities/resource.entity';
import { PermissionActionEntity }                       from '@modules/permissions/entities/action.entity';

@Entity({tableName: 'permission_resource_action'})
@Index({properties: [ 'resource', 'action' ]})
@Unique({properties: [ 'resource', 'action' ]})
export class ResourceActionEntity {
  @PrimaryKey()
  id: number;

  @ManyToOne(() => PermissionResourceEntity)
  resource: PermissionResourceEntity;

  @ManyToOne(() => PermissionActionEntity)
  action: PermissionActionEntity;

  constructor(resource: PermissionResourceEntity, action: PermissionActionEntity) {
    this.resource = resource;
    this.action = action;
  }
}
