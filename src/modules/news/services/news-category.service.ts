import { ConflictException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CommonService }           from '@common/common.service';
import { NewsCategoryEntity }      from '@modules/news/entities/news-category.entity';
import { CreateNewsCategoriesDto } from '@modules/news/dtos/create-news-categories.dto';
import { isUUID }                  from 'class-validator';
import { NewsRepository }          from '@modules/news/entities/repositories/news.repository';

@Injectable()
export class NewsCategoryService {
  constructor(
    @InjectRepository(NewsCategoryEntity) private readonly _newsCategoryRepository: EntityRepository<NewsCategoryEntity>,
    private readonly _newsRepository: NewsRepository,
    private readonly _commonService: CommonService
  ) {}

  public async findAll(companyId: string): Promise<NewsCategoryEntity[]> {
    return this._newsCategoryRepository.find({company: companyId});
  }

  /**
   * Find one news category by slug or id
   *
   * @param slugOrId
   * @param companyId
   *
   * @returns Promise<NewsCategoryEntity>
   */
  public async findOneBySlugOrId(slugOrId: string, companyId: string): Promise<NewsCategoryEntity> {
    return this._newsCategoryRepository.findOne({
      $or: [
        {id: isUUID(slugOrId) ? slugOrId : undefined},
        {slug: slugOrId}
      ],
      $and: [
        {company: companyId}
      ]
    });
  }

  /**
   * Create a news category
   *
   * @param {CreateNewsCategoriesDto} createNewsCategoriesDto - DTO with the news category data
   * @param {string} companyId - Company ID
   * @param {number} userId - User ID
   *
   * @returns Promise<NewsCategoryEntity>
   */
  public async create(createNewsCategoriesDto: CreateNewsCategoriesDto, companyId: string, userId: string): Promise<NewsCategoryEntity> {
    if (!createNewsCategoriesDto.slug) createNewsCategoriesDto.slug = await this.generateSlug(createNewsCategoriesDto.name, companyId);

    const count: number = await this.countBySlug(createNewsCategoriesDto.slug, companyId);

    if (count > 0) throw new ConflictException('SLUG_ALREADY_EXISTS');

    const newNewsCategory: NewsCategoryEntity = this._newsCategoryRepository.create({
      ...createNewsCategoriesDto,
      company: companyId,
      createdBy: userId,
    });

    await this._commonService.saveEntity(newNewsCategory, true);
    return newNewsCategory;
  }

  /**
   * Delete a news category
   *
   * @param {string} id - News category ID
   * @param {string} companyId - Company ID
   *
   * @returns Promise<void>
   */
  public async delete(id: string, companyId: string): Promise<void> {
    const newsCategory: NewsCategoryEntity = await this._newsCategoryRepository.findOneOrFail({
      id,
      company: companyId
    });

    const news = await this._newsRepository.findAllByCategoryId(id, companyId);

    // if (news.length > 0) throw new ConflictException('NEWS_CATEGORY_HAS_NEWS');

    if (news.length > 0) {
      for (const n of news) {
        n.category = null;
        await this._commonService.saveEntity(n);
      }
    }

    await this._commonService.removeEntity(newsCategory);
  }

  private async generateSlug(name: string, companyId: string): Promise<string> {
    const pointSlug = this._commonService.generatePointSlug(name);
    const count = await this.countBySlugLike(pointSlug, companyId);

    if (count > 0) {
      return `${ pointSlug }${ count }`;
    }

    return pointSlug;
  }

  private countBySlugLike = (slug: string, companyId: string): Promise<number> =>
    this._newsCategoryRepository.count({
      slug: {$like: `${ slug }%`},
      company: {$eq: companyId,}
    });

  private countBySlug = (slug: string, companyId: string): Promise<number> =>
    this._newsCategoryRepository.count({slug, company: companyId});
}
