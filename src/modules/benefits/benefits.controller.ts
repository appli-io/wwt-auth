import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { BenefitsService }                   from '@modules/benefits/benefits.service';
import { MemberGuard }                       from '@modules/auth/guards/member.guard';
import { RolesGuard }                        from '@modules/auth/guards/roles.guard';
import { CurrentCompanyId }                  from '@modules/company/decorators/company-id.decorator';

@UseGuards(MemberGuard, RolesGuard)
@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  @Get('benefit')
  public async findAll(@CurrentCompanyId() companyId: string) {
    return this.benefitsService.findAllBenefits(companyId);
  }

  @Get('benefit/:id')
  public async findOne(@CurrentCompanyId() companyId: string, @Param('id') id: string) {
    return this.benefitsService.findOneBenefit(id, companyId);
  }

  @Get('category')
  public async findAllCategories(@CurrentCompanyId() companyId: string) {
    return this.benefitsService.findAllCategories(companyId);
  }
}
