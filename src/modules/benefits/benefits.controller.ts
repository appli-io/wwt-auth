import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { BenefitsService }                               from '@modules/benefits/benefits.service';
import { MemberGuard }                                   from '@modules/auth/guards/member.guard';
import { RolesGuard }                                    from '@modules/auth/guards/roles.guard';
import { CurrentCompanyId }                              from '@modules/company/decorators/company-id.decorator';
import { CreateBenefitCategoryDto }                      from '@modules/benefits/dtos/create-benefit-category.dto';
import { RequiredRole }                                  from '@modules/auth/decorators/requierd-role.decorator';
import { RoleEnum }                                      from '@modules/company-user/enums/role.enum';
import { CurrentMember }                                 from '@modules/auth/decorators/current-member.decorator';
import { CompanyUserEntity }                             from '@modules/company-user/entities/company-user.entity';
import { CreateBenefitDto }                              from '@modules/benefits/dtos/create-benefit.dto';
import { CreateBenefitCompanyDto }                       from '@modules/benefits/dtos/create-benefit-company.dto';

@UseGuards(MemberGuard, RolesGuard)
@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  // Benefits Methods
  @Get('benefit')
  public async findAll(@CurrentCompanyId() companyId: string) {
    return this.benefitsService.findAllBenefits(companyId);
  }

  @Get('benefit/:id')
  public async findOne(@CurrentCompanyId() companyId: string, @Param('id') id: string) {
    return this.benefitsService.findOneBenefit(id, companyId);
  }

  @RequiredRole(RoleEnum.ADMIN)
  @Post('benefit')
  public async create(
    @CurrentMember() member: CompanyUserEntity,
    @Body() dto: CreateBenefitDto
  ) {
    return this.benefitsService.createBenefit(dto, member);
  }

  // Category Methods
  @Get('category')
  public async findAllCategories(@CurrentCompanyId() companyId: string) {
    return this.benefitsService.findAllCategories(companyId);
  }

  @RequiredRole(RoleEnum.ADMIN)
  @Post('category')
  public async createCategory(
    @CurrentMember() member: CompanyUserEntity,
    @Body() dto: CreateBenefitCategoryDto
  ) {
    return this.benefitsService.createCategory(dto, member);
  }

  // Company Methods
  @Get('company')
  public async findAllCompanies(@CurrentCompanyId() companyId: string) {
    return this.benefitsService.findAllCompanies(companyId);
  }

  @RequiredRole(RoleEnum.ADMIN)
  @Post('company')
  public async createCompany(
    @CurrentMember() member: CompanyUserEntity,
    @Body() dto: CreateBenefitCompanyDto
  ) {
    return this.benefitsService.createCompany(dto, member);
  }
}
