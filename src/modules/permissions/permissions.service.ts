import { Injectable }       from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CommonService }            from '@common/common.service';
import { PermissionActionEntity }   from '@modules/permissions/entities/action.entity';
import { PermissionResourceEntity } from '@modules/permissions/entities/resource.entity';
import { ResourceActionEntity }     from '@modules/permissions/entities/resource-action.entity';
import { RolEntity }                from '@modules/users/entities/rol.entity';
import { CreateActionDto }          from '@modules/permissions/dtos/create-action.dto';
import { CreateResourceDto }        from '@modules/permissions/dtos/create-resource.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(PermissionActionEntity) private readonly permissionActionRepository: EntityRepository<PermissionActionEntity>,
    @InjectRepository(PermissionResourceEntity) private readonly permissionResourceRepository: EntityRepository<PermissionResourceEntity>,
    @InjectRepository(ResourceActionEntity) private readonly resourceActionRepository: EntityRepository<ResourceActionEntity>,
    @InjectRepository(RolEntity) private readonly rolRepository: EntityRepository<RolEntity>,
    private readonly commonService: CommonService
  ) {}

  public async findAllResources() {
    return this.permissionResourceRepository.findAll({
      orderBy: {id: 'DESC'}
    });
  }

  public async createResource(createResourceDto: CreateResourceDto) {
    const resource = this.permissionResourceRepository.create({...createResourceDto});
    await this.commonService.saveEntity(resource, true);
    return resource;
  }

  public async findAllActions() {
    return this.permissionActionRepository.findAll({
      orderBy: {id: 'DESC'}
    });
  }

  public async createAction(createActionDto: CreateActionDto) {
    const action = this.permissionActionRepository.create({...createActionDto});
    await this.commonService.saveEntity(action, true);
    return action;
  }

  public async findAllRoles() {
    return this.rolRepository.findAll({
      orderBy: {id: 'DESC'}
    });
  }

  public async createRole() {
    return 'createRole';
  }

  public async findAllResourceActions() {
    return this.resourceActionRepository.findAll({
      orderBy: {id: 'DESC'}
    });
  }

  public async createResourceAction() {
    return 'createResourceAction';
  }
}
