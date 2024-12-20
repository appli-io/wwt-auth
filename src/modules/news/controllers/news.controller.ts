import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors
}                  from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { Page, Pageable, PageableDefault } from '@lib/pageable';
import { CurrentUser }                     from '@modules/auth/decorators/current-user.decorator';
import { MemberGuard }                     from '@modules/auth/guards/member.guard';
import { CommentService }                  from '@modules/comment/comment.service';
import { CurrentCompanyId }                from '@modules/company/decorators/company-id.decorator';
import { CompanyUserService }              from '@modules/company-user/company-user.service';
import { RoleEnum }                        from '@modules/company-user/enums/role.enum';
import { LikeService }                     from '@modules/likes/like.service';
import { CreateNewsDto }                   from '@modules/news/dtos/create-news.dto';
import { ResponseAllNewsMapper }           from '@modules/news/mappers/response-all-news.mapper';
import { NewsService }                     from '@modules/news/services/news.service';
import { ContentType }                     from '@modules/shared/enums/content-type.enum';
import { ResponseFullNewsMapper }          from '@modules/news/mappers/response-full-news.mapper';
import { NewsQueryDto }                    from '@modules/news/dtos/news-query.dto';
import { AnyFilesInterceptor }             from '@nest-lab/fastify-multer';
import { VALID_IMAGE_TYPES }               from '@common/constant';
import { MessageMapper }                   from '@common/mappers/message.mapper';

const MAX_HIGHLIGHTED_NEWS = 5;

@ApiTags('News')
@Controller('news')
@UseGuards(MemberGuard) // 👈 Validate user is an active member of the company
export class NewsController {
  private readonly _logger = new Logger(NewsController.name);

  constructor(
    private readonly _newsService: NewsService,
    private readonly _companyUserService: CompanyUserService,
    private readonly _likeService: LikeService,
    private readonly _commentService: CommentService
  ) {}

  @Get()
  public async findAll(
    @CurrentCompanyId() companyId: string,
    @PageableDefault() pageable: Pageable,
    @Query() query: NewsQueryDto,
  ) {
    const pageableNews = await this._newsService.findAll(query, pageable, companyId);

    this._logger.log(`Found ${ pageableNews.content.length } news`);

    return {
      ...pageableNews,
      content: pageableNews.content.map(ResponseAllNewsMapper.map),
    } as Page<ResponseAllNewsMapper>;
  }

  @Get(':slugOrId')
  public async findOne(
    @Param('slugOrId') slugOrId: string,
  ) {
    const news = await this._newsService.findOneBySlugOrId(slugOrId);

    if (!news) throw new NotFoundException('News not found');

    return ResponseFullNewsMapper.map(news);
  }

  @Get('highlighted')
  public async findHighlighted(
    @CurrentCompanyId() companyId: string,
    @PageableDefault({limit: MAX_HIGHLIGHTED_NEWS, enableUnpaged: true, unpaged: true}) pageable: Pageable,
  ) {
    const news = await this._newsService.findAll({highlighted: true}, pageable, companyId);

    return news.content.map(ResponseAllNewsMapper.map);
  }

  @Post()
  @UseInterceptors(AnyFilesInterceptor({
    fileFilter: (req, file, cb) => {
      if (!VALID_IMAGE_TYPES.includes(file.mimetype)) {
        return cb(new BadRequestException('INVALID_IMAGE_TYPE'), false);
      }

      cb(null, true);
    }
  }))
  public async create(
    @CurrentUser() userId: string,
    @CurrentCompanyId() companyId: string,
    @Body() news: CreateNewsDto,
    @UploadedFiles() files?: Express.Multer.File[]
  ) {
    const images = files?.filter(file => file.fieldname === 'images');
    const portraitImage = files?.find(file => file.fieldname === 'portraitImage');
    const createdNews = await this._newsService.create(news, images, portraitImage, userId, companyId);

    return ResponseFullNewsMapper.map(createdNews);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  public async delete(
    @CurrentUser() userId: string,
    @CurrentCompanyId() companyId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const isAdmin = !!(await this._companyUserService.getUserRole(companyId, userId, [ RoleEnum.ADMIN ]));

    await this._newsService.delete(id, userId, companyId, isAdmin);

    return new MessageMapper('News deleted');
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

  @Get(':id/like')
  public async getLikes(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    console.log(this._likeService.findAndCountBy({contentType: ContentType.NEWS, contentId: id}));
  }

  @Post(':id/like')
  public async like(
    @CurrentUser() userId: string,
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
