import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors
}                                               from '@nestjs/common';
import { BenefitsService }                      from '@modules/benefits/benefits.service';
import { MemberGuard }                          from '@modules/auth/guards/member.guard';
import { RolesGuard }                           from '@modules/auth/guards/roles.guard';
import { CurrentCompanyId }                     from '@modules/company/decorators/company-id.decorator';
import { CreateBenefitCategoryDto }             from '@modules/benefits/dtos/create-benefit-category.dto';
import { RequiredRole }                         from '@modules/auth/decorators/requierd-role.decorator';
import { RoleEnum }                             from '@modules/company-user/enums/role.enum';
import { CurrentMember }                        from '@modules/auth/decorators/current-member.decorator';
import { CompanyUserEntity }                    from '@modules/company-user/entities/company-user.entity';
import { CreateBenefitDto }                     from '@modules/benefits/dtos/create-benefit.dto';
import { CreateBenefitCompanyDto }              from '@modules/benefits/dtos/create-benefit-company.dto';
import { LayoutEnum }                           from '@common/enums/layout.enum';
import { BenefitCategoryFullMapper }            from './mappers/benefit-category-full.mapper';
import { BenefitCategorySelectorMapper }        from '@modules/benefits/mappers/benefit-category-selector.mapper';
import { AnyFilesInterceptor, FileInterceptor } from '@nest-lab/fastify-multer';
import { VALID_IMAGE_TYPES }                    from '@common/constant';

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
  public async findAllCategories(
    @CurrentCompanyId() companyId: string,
    @Query('layout') layout: LayoutEnum
  ) {
    const results = await this.benefitsService.findAllCategories(companyId);

    switch (layout) {
      case LayoutEnum.SELECTOR:
        return results.map((category) => BenefitCategorySelectorMapper.map(category));
      case LayoutEnum.FULL:
        return results.map((category) => BenefitCategoryFullMapper.map(category));
      default:
        return results;
    }
  }

  @RequiredRole(RoleEnum.ADMIN)
  @UseInterceptors(AnyFilesInterceptor({
    fileFilter: (req, file, cb) => {
      if (!VALID_IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('INVALID_IMAGE_TYPE'), false);
      }

      cb(null, true);
    }
  }))
  @Post('category')
  public async createCategory(
    @CurrentMember() member: CompanyUserEntity,
    @Body() dto: CreateBenefitCategoryDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    dto.icon = files.find((file) => file.fieldname === 'icon');
    dto.image = files.find((file) => file.fieldname === 'image');

    console.log('files: ', files);
    console.log('dto: ', dto);

    return this.benefitsService.createCategory(dto, member);
  }

  @RequiredRole(RoleEnum.ADMIN)
  @Delete('category/:id')
  public async deleteCategory(
    @CurrentCompanyId() companyId: string,
    @Param('id') id: string
  ) {
    return this.benefitsService.deleteCategory(id, companyId);
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
}
