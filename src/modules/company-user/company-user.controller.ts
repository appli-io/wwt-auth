import { Body, Controller, Get, Param, Post, UseGuards }  from '@nestjs/common';
import { CreateCompanyUserInviteDto }                     from './dtos/create-company-user-invite.dto';
import { CompanyUserService }                             from '@modules/company-user/company-user.service';
import { CompanyUserInviteService }                       from './company-user-invite.service';
import { CurrentCompanyId }                               from '@modules/company/decorators/company-id.decorator';
import { CurrentUser }                                    from '@modules/auth/decorators/current-user.decorator';
import { RequiredRole }                                   from '@modules/auth/decorators/requierd-role.decorator';
import { RolesGuard }                                     from '@modules/auth/guards/roles.guard';
import { RoleEnum }                                       from './enums/role.enum';

@UseGuards(RolesGuard)
@Controller('company-user')
export class CompanyUserController {
  constructor(
    private readonly _companyUserService: CompanyUserService,
    private readonly _companyUserInviteService: CompanyUserInviteService
  ) { }

  @Get('/:companyId/validate-user')
  public async validateUser(
    @Param('companyId') companyId: string,
    @CurrentUser() userId: string
  ) {
    return await this._companyUserService.isUserInCompany(companyId, userId);
  }

  @Get('/invitations')
  public async getAllInvites(
    @CurrentCompanyId() companyId: string,
  ) {
    return await this._companyUserInviteService.getAll(companyId);
  }

  @Post('/invite')
  @RequiredRole(RoleEnum.ADMIN)
  public async inviteUser(
    @CurrentCompanyId() companyId: string,
    @CurrentUser() user: string,
    @Body() createInviteDto: CreateCompanyUserInviteDto
  ) {
    return await this._companyUserInviteService.create(createInviteDto, companyId, user);
  }
}
