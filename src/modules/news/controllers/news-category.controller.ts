import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';

import { NewsCategoryService }     from '@modules/news/news-category.service';
import { MemberGuard }             from '@modules/auth/guards/member.guard';
import { CurrentCompanyId }        from '@modules/company/decorators/company-id.decorator';
import { CurrentUser }             from '@modules/auth/decorators/current-user.decorator';
import { CreateNewsCategoriesDto } from '@modules/news/dtos/create-news-categories.dto';

@Controller('news/category')
@UseGuards(MemberGuard)
export class NewsCategoryController {
  constructor(
    private readonly _newsCategoryService: NewsCategoryService
  ) {}

  @Get()
  public async findAll() {
    return this._newsCategoryService.findAll();
  }

  @Get(':slugOrId')
  public async findOne(@CurrentCompanyId() companyId: string, @Param('slugOrId') slugOrId: string) {
    return this._newsCategoryService.findOneBySlugOrId(slugOrId, companyId);
  }

  @Post()
  public async create(
    @CurrentUser() userId: number,
    @CurrentCompanyId() companyId: string,
    @Body() createNewsCategoriesDto: CreateNewsCategoriesDto
  ) {
    return this._newsCategoryService.create(createNewsCategoriesDto, companyId, userId);
  }
}
