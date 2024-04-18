import { Controller, Get, Param } from '@nestjs/common';
import { CompanyUserService }     from '@modules/company-user/company-user.service';
import { CurrentUser }            from '@modules/auth/decorators/current-user.decorator';

@Controller('company-user')
export class CompanyUserController {
  constructor(private readonly _companyUserService: CompanyUserService) {}

  @Get('/:companyId/validate-user')
  public async validateUser(
    @Param('companyId') companyId: string,
    @CurrentUser() userId: number
  ) {
    return await this._companyUserService.isUserInCompany(companyId, userId);
  }
}
