import { Controller, Get, Param } from '@nestjs/common';
import { CompanyUserService } from '@modules/company-user/company-user.service';
import { CurrentUser } from '@modules/auth/decorators/current-user.decorator';
import { CompanyUserInviteService } from './company-user-invite.service';

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

  @Get('/:companyId/invitations')
  public async getAllInvites(
    @Param('companyId') companyId: string
  ) {
    return await this._companyUserInviteService.getAll(companyId)
  }
}
