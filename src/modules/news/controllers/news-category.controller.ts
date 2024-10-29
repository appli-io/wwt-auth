import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';

import { CurrentUser }                          from '@modules/auth/decorators/current-user.decorator';
import { MemberGuard }                          from '@modules/auth/guards/member.guard';
import { CurrentCompanyId }                     from '@modules/company/decorators/company-id.decorator';
import { CreateNewsCategoriesDto }              from '@modules/news/dtos/create-news-categories.dto';
import { NewsCategoryService }                  from '@modules/news/services/news-category.service';
import { ResponseAllNewsCategoriesMapper }      from '@modules/news/mappers/response-all-news-categories.mapper';
import { ResponseNewsCategoriesSelectorMapper } from '@modules/news/mappers/response-news-categories-selector.mapper';
import { RolesGuard }                           from '@modules/auth/guards/roles.guard';
import { RequiredRole }                         from '@modules/auth/decorators/requierd-role.decorator';
import { RoleEnum }                             from '@modules/company-user/enums/role.enum';

@Controller('news-category')
@UseGuards(MemberGuard, RolesGuard)
export class NewsCategoryController {
  constructor(
    private readonly _newsCategoryService: NewsCategoryService
  ) {}

  @Get()
  public async findAll(@CurrentCompanyId() companyId: string) {
    const categories = await this._newsCategoryService.findAll(companyId);

    return categories.map(ResponseAllNewsCategoriesMapper.map);
  }

  @Get('selector')
  public async findAllForSelector(@CurrentCompanyId() companyId: string) {
    const categories = await this._newsCategoryService.findAll(companyId);

    return categories.map(ResponseNewsCategoriesSelectorMapper.map);
  }

  @Get(':slugOrId')
  public async findOne(@CurrentCompanyId() companyId: string, @Param('slugOrId') slugOrId: string) {
    return this._newsCategoryService.findOneBySlugOrId(slugOrId, companyId);
  }

  @Post()
  @RequiredRole(RoleEnum.ADMIN)
  public async create(
    @CurrentUser() userId: string,
    @CurrentCompanyId() companyId: string,
    @Body() createNewsCategoriesDto: CreateNewsCategoriesDto
  ) {
    return this._newsCategoryService.create(createNewsCategoriesDto, companyId, userId);
  }

  @Delete(':id')
  @RequiredRole(RoleEnum.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(@Param('id') id: string, @CurrentCompanyId() companyId: string) {
    return this._newsCategoryService.delete(id, companyId);
  }
}
