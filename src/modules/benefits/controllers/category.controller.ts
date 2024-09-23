import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';

import { AnyFilesInterceptor } from '@nest-lab/fastify-multer';

import { LayoutEnum }                    from '@common/enums/layout.enum';
import { VALID_IMAGE_TYPES }             from '@common/constant';
import { CurrentMember }                 from '@modules/auth/decorators/current-member.decorator';
import { RequiredRole }                  from '@modules/auth/decorators/requierd-role.decorator';
import { MemberGuard }                   from '@modules/auth/guards/member.guard';
import { RolesGuard }                    from '@modules/auth/guards/roles.guard';
import { CompanyUserEntity }             from '@modules/company-user/entities/company-user.entity';
import { RoleEnum }                      from '@modules/company-user/enums/role.enum';
import { CurrentCompanyId }              from '@modules/company/decorators/company-id.decorator';
import { BenefitsService }               from '@modules/benefits/benefits.service';
import { CreateBenefitCategoryDto }      from '@modules/benefits/dtos/create-benefit-category.dto';
import { BenefitCategorySelectorMapper } from '@modules/benefits/mappers/benefit-category-selector.mapper';
import { BenefitCategoryCompactMapper }  from '@modules/benefits/mappers/benefit-category-compact.mapper';
import { BenefitCategoryFullMapper }     from '@modules/benefits/mappers/benefit-category-full.mapper';
import { BenefitCompactMapper }          from '@modules/benefits/mappers/benefit-compact.mapper';

@UseGuards(MemberGuard, RolesGuard)
@Controller('benefit-category')
export class BenefitCategoryController {
  constructor(
    private readonly benefitsService: BenefitsService
  ) {}

  // Category Methods
  @Get()
  public async findAllCategories(
    @CurrentCompanyId() companyId: string,
    @Query('layout') layout: LayoutEnum
  ) {
    const results = await this.benefitsService.findAllCategories(companyId);

    switch (layout) {
      case LayoutEnum.SELECTOR:
        return results.map((category) => BenefitCategorySelectorMapper.map(category));
      case LayoutEnum.COMPACT:
        return results.map((category) => BenefitCategoryCompactMapper.map(category));
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
  @Post()
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

  @Get('most-viewed')
  public async findMostViewed(
    @CurrentCompanyId() companyId: string,
    @Query('limit') limit: number = 3
  ) {
    return this.benefitsService.findMostViewedCategories(companyId, limit);
  }

  @Get(':id')
  public async findOneCategory(
    @CurrentCompanyId() companyId: string,
    @Param('id') id: string
  ) {
    const category = await this.benefitsService.findOneCategory(id, companyId);

    return BenefitCategoryFullMapper.map(category);
  }

  @Get(':id/benefits')
  public async findCategoryBenefits(
    @CurrentCompanyId() companyId: string,
    @Param('id') id: string
  ) {
    const benefits = await this.benefitsService.findCategoryBenefits(id, companyId);

    return benefits.map(BenefitCompactMapper.map);
  }

  @RequiredRole(RoleEnum.ADMIN)
  @Delete(':id')
  public async deleteCategory(
    @CurrentCompanyId() companyId: string,
    @Param('id') id: string
  ) {
    return this.benefitsService.deleteCategory(id, companyId);
  }
}
