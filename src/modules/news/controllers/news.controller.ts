import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards
}                  from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CurrentUser }           from '@modules/auth/decorators/current-user.decorator';
import { MemberGuard }           from '@modules/auth/guards/member.guard';
import { CommentService }        from '@modules/comment/comment.service';
import { CurrentCompanyId }      from '@modules/company/decorators/company-id.decorator';
import { CompanyUserService }    from '@modules/company-user/company-user.service';
import { RoleEnum }              from '@modules/company-user/enums/role.enum';
import { LikeService }           from '@modules/likes/like.service';
import { CreateNewsDto }         from '@modules/news/dtos/create-news.dto';
import { ResponseAllNewsMapper } from '@modules/news/mappers/response-all-news.mapper';
import { NewsService }           from '@modules/news/news.service';
import { ContentType }           from '@modules/shared/enums/content-type.enum';

@ApiTags('News')
@Controller('news')
@UseGuards(MemberGuard) // 👈 Validate user is an active member of the company
export class NewsController {
  constructor(
    private readonly _newsService: NewsService,
    private readonly _companyUserService: CompanyUserService,
    private readonly _likeService: LikeService,
    private readonly _commentService: CommentService
  ) {}

  @Get()
  public async findAll() {
    const news = await this._newsService.findAll();

    return news.map(ResponseAllNewsMapper.map);
  }

  @Get(':slugOrId')
  public async findOne(
    @Param('slugOrId') slugOrId: string,
  ) {
    const news = await this._newsService.findOneBySlugOrId(slugOrId);

    if (!news) throw new NotFoundException('News not found');

    return ResponseAllNewsMapper.map(news);
  }

  @Get('social/:id/count')
  public async findOneSocial(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const likes: number = await this._likeService.countByContentTypeAndContentId(ContentType.NEWS, id);
    const comments: number = await this._commentService.countBy({contentType: ContentType.NEWS, contentId: id});

    return {
      counts: {
        likes,
        comments,
      }
    };
  }

  @Post()
  public async create(
    @CurrentUser() userId: number,
    @CurrentCompanyId() companyId: string,
    @Body() news: CreateNewsDto,
  ) {
    const createdNews = await this._newsService.create(news, userId, companyId);
    return createdNews.id;
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

  @Get(':id/like')
  public async getLikes(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    console.log(this._likeService.findAndCountBy({contentType: ContentType.NEWS, contentId: id}));
  }

  @Post(':id/like')
  public async like(
    @CurrentUser() userId: number,
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
