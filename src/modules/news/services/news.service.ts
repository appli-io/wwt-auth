import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { QBFilterQuery }    from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { isUUID }           from 'class-validator';

import { CommonService }               from '@common/common.service';
import { Page, Pageable, PageFactory } from '@lib/pageable';
import { NewsEntity }                  from '@modules/news/entities/news.entity';
import { CreateNewsDto }               from '@modules/news/dtos/create-news.dto';
import { NewsQueryDto }                from '@modules/news/dtos/news-query.dto';

@Injectable()
export class NewsService {

  constructor(
    @InjectRepository(NewsEntity) private readonly _newsRepository: EntityRepository<NewsEntity>,
    private readonly _commonService: CommonService,
  ) {}

  public async findAll(query: NewsQueryDto, pageable: Pageable, companyId: string): Promise<Page<NewsEntity>> {
    const whereClause: QBFilterQuery<NewsEntity> = {company: companyId};

    if (query.id) whereClause['id'] = {$ilike: `%${ query.id }%`};
    if (query.headline) whereClause['headline'] = {$ilike: `%${ query.headline }%`};
    if (query.slug) whereClause['slug'] = {$ilike: `%${ query.slug }%`};
    if (query.authorId) whereClause['createdBy.id'] = {$ilike: `%${ query.authorId }%`};
    if (query.authorName) whereClause['createdBy.name'] = {$ilike: `%${ query.authorName }%`};

    return await new PageFactory(
      pageable,
      this._newsRepository,
      {
        where: whereClause,
        relations: [
          {
            property: 'createdBy', // join author
            andSelect: true
          },
          {
            property: 'category', // join category
            andSelect: true
          }
        ]
      }
    ).create();
  }

  public async findOneBySlugOrId(slugOrId: string): Promise<NewsEntity> {
    if (isUUID(slugOrId)) return this._newsRepository.findOne({id: slugOrId});
    else return this._newsRepository.findOne({slug: slugOrId});
  }

  public async create(newsDto: CreateNewsDto, userId: number, companyId: string): Promise<NewsEntity> {
    if (!newsDto.slug) newsDto.slug = await this.generateSlug(newsDto.headline, companyId);
    else {
      const count: number = await this.countBySlugLike(newsDto.slug, companyId);

      if (count > 0) throw new ConflictException('Slug already exists');
    }

    const news: NewsEntity = this._newsRepository.create({
      ...newsDto,
      category: newsDto.categoryId,
      createdBy: userId,
      company: companyId,
    });

    await this._commonService.saveEntity(news, true);
    return news;
  }

  public async delete(id: string, userId: number, companyId: string, isAdmin: boolean): Promise<void> {
    const news: NewsEntity = await this._newsRepository.findOne({id, company: companyId}, {populate: [ 'createdBy' ]});

    if (!news)
      throw new NotFoundException('News not found. (id: ' + id + ')');

    if (!isAdmin && news.createdBy.id !== userId)
      throw new UnauthorizedException('You are not allowed to delete this news');

    news.isDeleted = true;
    await this._commonService.saveEntity(news);
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
}
