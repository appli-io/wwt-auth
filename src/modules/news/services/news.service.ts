import { BadRequestException, ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { QBFilterQuery, wrap }             from '@mikro-orm/core';
import { InjectRepository }                from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { isUUID }                          from 'class-validator';

import { CommonService }               from '@common/common.service';
import { Page, Pageable, PageFactory } from '@lib/pageable';
import { NewsEntity }                  from '@modules/news/entities/news.entity';
import { CreateNewsDto }               from '@modules/news/dtos/create-news.dto';
import { NewsQueryDto }                from '@modules/news/dtos/news-query.dto';
import { NewsCategoryService }         from '@modules/news/services/news-category.service';
import { StorageService }              from '@modules/firebase/services/storage.service';
import { FileType }                    from '@modules/firebase/enums/file-type.enum';
import { optimizeImage }               from '@common/utils/file.utils';

@Injectable()
export class NewsService {

  constructor(
    @InjectRepository(NewsEntity) private readonly _newsRepository: EntityRepository<NewsEntity>,
    private readonly _em: EntityManager,
    private readonly _newsCategoryService: NewsCategoryService,
    private readonly _commonService: CommonService,
    private readonly _storageService: StorageService
  ) {}

  public async findAll(query: NewsQueryDto, pageable: Pageable, companyId: string): Promise<Page<NewsEntity>> {
    const whereClause: QBFilterQuery<NewsEntity> = {
      company: companyId,
      deletedAt: null
    };

    if (query.id) whereClause['id'] = {$eq: query.id};
    if (query.headline) whereClause['headline'] = {$ilike: `%${ query.headline }%`};
    if (query.slug) whereClause['slug'] = {$ilike: `%${ query.slug }%`};
    if (query.authorId) whereClause['createdBy.id'] = {$eq: query.authorId};
    if (query.authorName) whereClause['createdBy.name'] = {$ilike: `%${ query.authorName }%`};
    if (query.category) whereClause['category.slug'] = {$eq: `${ query.category }`};

    pageable.sort.push({
      property: 'publishedAt',
      direction: 'desc',
      nullsFirst: false
    });

    return await new PageFactory(
      pageable,
      this._newsRepository,
      {
        where: whereClause,
        relations: [
          {
            property: 'createdBy', // join author
            andSelect: true,
          },
          {
            property: 'createdBy.avatar', // join author
            andSelect: true,
            type: 'leftJoin'
          },
          {
            property: 'category', // join category
            andSelect: true
          },
          {
            property: 'images', // join images
            type: 'leftJoin',
            andSelect: true
          },
          {
            property: 'portraitImage', // join portraitImage
            type: 'leftJoin',
            andSelect: true
          }
        ]
      }
    ).create();
  }

  public async findOneBySlugOrId(slugOrId: string): Promise<NewsEntity> {
    let response: NewsEntity;
    if (isUUID(slugOrId)) response = await this._newsRepository.findOne({id: slugOrId}, {populate: [ 'createdBy', 'company', 'portraitImage', 'images' ]});
    else response = await this._newsRepository.findOne({slug: slugOrId}, {populate: [ 'createdBy', 'company', 'portraitImage', 'images' ]}) as NewsEntity;

    if (!response) throw new NotFoundException('NEWS_NOT_FOUND');

    return response;
  }

  public async create(newsDto: CreateNewsDto, images: Express.Multer.File[], portraitImage: Express.Multer.File, userId: string, companyId: string): Promise<NewsEntity> {
    if (!newsDto.slug) newsDto.slug = await this.generateSlug(newsDto.headline, companyId);
    else {
      const count: number = await this.countBySlugLike(newsDto.slug, companyId);

      if (count > 0) throw new ConflictException('Slug already exists');
    }

    const category = await this._newsCategoryService.findOneBySlugOrId(newsDto.category, companyId);

    if (!category) throw new BadRequestException('Category not found');

    const news: NewsEntity = this._newsRepository.create({
      ...newsDto,
      category: category.id,
      createdBy: userId,
      company: companyId,
    });

    const basePath = this.buildNewsImageFilepath(companyId, news.id);

    if (images?.length > 0)
      news.images.add(await Promise.all(images.map(async (image) => {
        image = await optimizeImage(image);
        return await this._storageService.upload(companyId, FileType.IMAGE, basePath, image);
      })));

    if (portraitImage) {
      news.portraitImage = await this._storageService.upload(companyId, FileType.IMAGE, basePath, portraitImage);
    }

    await this._commonService.saveEntity(news, true);
    return news;
  }

  public async delete(id: string, userId: string, companyId: string, isAdmin: boolean): Promise<void> {
    const news: NewsEntity = await this._newsRepository.findOne({
      id,
      company: companyId
    }, {populate: [ 'createdBy', 'images', 'portraitImage' ]});

    if (!news)
      throw new NotFoundException('News not found. (id: ' + id + ')');

    if (!isAdmin && news.createdBy.id !== userId)
      throw new UnauthorizedException('You are not allowed to delete this news');

    const deletePromises = news.images.map(image => this._storageService.removeFile(image));
    if (news.portraitImage) deletePromises.push(this._storageService.removeFile(news.portraitImage));

    await Promise.all(deletePromises);

    await this._em
      .persistAndFlush(
        wrap(news)
          .assign({
            body: undefined,
            deletedBy: userId,
            deletedAt: new Date()
          }));

    // await this._commonService.saveEntity(news);
  }

  private async generateSlug(name: string, companyId: string): Promise<string> {
    const pointSlug = this._commonService.generatePointSlug(name);
    const count = await this.countBySlugLike(pointSlug, companyId);

    if (count > 0) {
      return `${ pointSlug }${ count }`;
    }

    return pointSlug;
  }

  private countBySlugLike(slug: string, companyId: string): Promise<number> {
    return this._newsRepository.count({
      slug: {$like: `${ slug }%`,},
      company: {$eq: companyId,},
    });
  }

  private buildNewsImageFilepath = (companyId: string, newsId: string) => `companies/${ companyId }/news/${ newsId }/images`;
}
