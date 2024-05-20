import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser }                     from '@modules/auth/decorators/current-user.decorator';
import { MemberGuard }                     from '@modules/auth/guards/member.guard';
import { CurrentCompanyId }                from '@modules/company/decorators/company-id.decorator';
import { CreateNewsCategoriesDto }         from '@modules/news/dtos/create-news-categories.dto';
import { NewsCategoryService }             from '@modules/news/services/news-category.service';
import { ResponseAllNewsCategoriesMapper } from '@modules/news/mappers/response-all-news-categories.mapper';

@Controller('news-category')
@UseGuards(MemberGuard)
export class NewsCategoryController {
  constructor(
    private readonly _newsCategoryService: NewsCategoryService
  ) {}

  @Get()
  public async findAll(@CurrentCompanyId() companyId: string) {
    const categories = await this._newsCategoryService.findAll(companyId);

    return categories.map(ResponseAllNewsCategoriesMapper.map);
  }

  @Get(':slugOrId')
  public async findOne(@CurrentCompanyId() companyId: string, @Param('slugOrId') slugOrId: string) {
    return this._newsCategoryService.findOneBySlugOrId(slugOrId, companyId);
  }

  @Post()
  public async create(
    @CurrentUser() userId: string,
    @CurrentCompanyId() companyId: string,
    @Body() createNewsCategoriesDto: CreateNewsCategoriesDto
  ) {
    return this._newsCategoryService.create(createNewsCategoriesDto, companyId, userId);
  }
}
