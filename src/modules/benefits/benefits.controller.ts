import { Body, Controller, Delete, Get, Param, Post, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { BenefitsService }                                                                             from '@modules/benefits/benefits.service';
import { MemberGuard }                                                                                 from '@modules/auth/guards/member.guard';
import { RolesGuard }                                                                                  from '@modules/auth/guards/roles.guard';
import { CurrentCompanyId }                                                                            from '@modules/company/decorators/company-id.decorator';
import { RequiredRole }                                                                                from '@modules/auth/decorators/requierd-role.decorator';
import { RoleEnum }                                                                                    from '@modules/company-user/enums/role.enum';
import { CurrentMember }                                                                               from '@modules/auth/decorators/current-member.decorator';
import { CompanyUserEntity }                                                                           from '@modules/company-user/entities/company-user.entity';
import { CreateBenefitDto }                                                                            from '@modules/benefits/dtos/create-benefit.dto';
import { CreateBenefitCompanyDto }                                                                     from '@modules/benefits/dtos/create-benefit-company.dto';
import { LayoutEnum }                                                                                  from '@common/enums/layout.enum';
import { FileInterceptor }                                                                             from '@nest-lab/fastify-multer';

@UseGuards(MemberGuard, RolesGuard)
@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  // Benefits Methods
  @Get('benefit')
  public async findAll(
    @CurrentCompanyId() companyId: string,
    @Query('layout') layout: LayoutEnum = LayoutEnum.FULL
  ) {
    return this.benefitsService.findAllBenefits(companyId);
  }

  @Get('benefit/:id')
  public async findOne(@CurrentCompanyId() companyId: string, @Param('id') id: string) {
    return this.benefitsService.findOneBenefit(id, companyId);
  }

  @RequiredRole(RoleEnum.ADMIN)
  @UseInterceptors(FileInterceptor('image'))
  @Post('benefit')
  public async create(
    @CurrentMember() member: CompanyUserEntity,
    @Body() dto: CreateBenefitDto,
    @UploadedFile() image: Express.Multer.File
  ) {
    if (image) dto.image = image;
    return this.benefitsService.createBenefit(dto, member);
  }

  @RequiredRole(RoleEnum.ADMIN)
  @Delete('benefit/:id')
  public async delete(@CurrentCompanyId() companyId: string, @Param('id') id: string) {
    return this.benefitsService.deleteBenefit(id, companyId);
  }


  // Company Methods
  @Get('company')
  public async findAllCompanies(@CurrentCompanyId() companyId: string) {
    return this.benefitsService.findAllCompanies(companyId);
  }

  @RequiredRole(RoleEnum.ADMIN)
  @Post('company')
  @UseInterceptors(FileInterceptor('image'))
  public async createCompany(
    @CurrentMember() member: CompanyUserEntity,
    @Body() dto: CreateBenefitCompanyDto,
    @UploadedFile() image: Express.Multer.File
  ) {
    if (image) dto.image = image;

    return this.benefitsService.createCompany(dto, member);
  }

  @RequiredRole(RoleEnum.ADMIN)
  @Delete('company/:id')
  public async deleteCompany(
    @CurrentCompanyId() companyId: string,
    @Param('id') id: string
  ) {
    return this.benefitsService.deleteCompany(id, companyId);
  }
}
