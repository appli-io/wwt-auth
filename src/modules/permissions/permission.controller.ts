import { ApiTags }                     from '@nestjs/swagger';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateActionDto }             from '@modules/permissions/dtos/create-action.dto';
import { PermissionsService }          from '@modules/permissions/permissions.service';

@ApiTags('Users')
@Controller('permissions')
export class PermissionController {

  constructor(private readonly permissionsService: PermissionsService) {}

  @Get('/resources')
  public getResources(): string {
    return 'resources';
  }

  @Post('/resources')
  public createResource(): string {
    return 'create resource';
  }

  @Get('/actions')
  public getActions(): string {
    return 'actions';
  }

  @Post('/actions')
  public async createAction(@Body() createActionDto: CreateActionDto) {
    return await this.permissionsService.createAction(createActionDto);
  }

  @Get('/roles')
  public getRoles(): string {
    return 'roles';
  }

  @Post('/roles')
  public createRole(): string {
    return 'create role';
  }

  @Get('/resource-actions')
  public getResourceActions(): string {
    return 'resource-actions';
  }

  @Post('/resource-actions')
  public createResourceAction(): string {
    return 'create resource-action';
  }

  @Get('/rol-resource-actions')
  public getRolResourceActions(): string {
    return 'rol-resource-actions';
  }

  @Post('/rol-resource-actions')
  public createRolResourceAction(): string {
    return 'create rol-resource-action';
  }
}
