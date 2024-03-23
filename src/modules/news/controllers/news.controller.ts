import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags }                                                                         from '@nestjs/swagger';

import { CurrentUser }        from '@modules/auth/decorators/current-user.decorator';
import { CurrentCompanyId }   from '@modules/company/decorators/company-id.decorator';
import { CompanyUserService } from '@modules/company-user/company-user.service';
import { RoleEnum }           from '@modules/company-user/enums/role.enum';
import { LikeService }        from '@modules/likes/like.service';
import { CreateNewsDto }      from '@modules/news/dtos/create-news.dto';
import { NewsService }        from '@modules/news/news.service';
import { ContentType }        from '@modules/shared/enums/content-type.enum';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(
    private readonly _newsService: NewsService,
    private readonly _companyUserService: CompanyUserService,
    private readonly _likeService: LikeService
  ) {}

  @Get()
  public async findAll() {
    return await this._newsService.findAll();
  }

  @Post()
  public async create(
    @CurrentUser() userId: number,
    @CurrentCompanyId() companyId: string,
    @Body() news: CreateNewsDto,
  ) {
    return this._newsService.create(news, userId, companyId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentUser() userId: number,
    @CurrentCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const isAdmin = !!(await this._companyUserService.getUserRole(companyId, userId, [ RoleEnum.ADMIN ]));

    await this._newsService.delete(id, userId, companyId, isAdmin);

    return 'News deleted';
  }

  @Post(':id/like')
  public async like(
    @CurrentUser() userId: number,
    @CurrentCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this._likeService.create({
      userId,
      contentType: ContentType.NEWS,
      contentId: id,
    });
  }

  @Post('comment')
  public async comment() {
    return 'Comment created';
  }

  @Delete('comment/:id')
  public async deleteComment() {
    return 'Comment deleted';
  }
}
