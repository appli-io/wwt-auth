import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CommonService } from '@common/common.service';
import { NewsEntity }    from '@modules/news/entities/news.entity';
import { CreateNewsDto } from '@modules/news/dtos/create-news.dto';
import { isUUID } from 'class-validator';

@Injectable()
export class NewsService {

  constructor(
    @InjectRepository(NewsEntity) private readonly _newsRepository: EntityRepository<NewsEntity>,
    private readonly _commonService: CommonService,
  ) {}

  public async findAll(): Promise<NewsEntity[]> {
    return this._newsRepository.findAll();
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
