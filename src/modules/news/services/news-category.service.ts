import { ConflictException, Injectable } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CommonService }           from '@common/common.service';
import { NewsCategoryEntity }      from '@modules/news/entities/news-category.entity';
import { CreateNewsCategoriesDto } from '@modules/news/dtos/create-news-categories.dto';

@Injectable()
export class NewsCategoryService {
  constructor(
    @InjectRepository(NewsCategoryEntity) private readonly _newsCategoryRepository: EntityRepository<NewsCategoryEntity>,
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
        {id: slugOrId},
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
  public async create(createNewsCategoriesDto: CreateNewsCategoriesDto, companyId: string, userId: number): Promise<NewsCategoryEntity> {
    if (!createNewsCategoriesDto.slug) createNewsCategoriesDto.slug = await this.generateSlug(createNewsCategoriesDto.name, companyId);

    const count: number = await this.countBySlug(createNewsCategoriesDto.slug, companyId);

    if (count > 0) throw new ConflictException('Slug already exists');

    const newNewsCategory: NewsCategoryEntity = this._newsCategoryRepository.create({
      ...createNewsCategoriesDto,
      company: companyId,
      createdBy: userId,
    });

    await this._commonService.saveEntity(newNewsCategory, true);
    return newNewsCategory;
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
      slug: {$like: `${ slug }%`,},
      company: {$eq: companyId,}
    });

  private countBySlug = (slug: string, companyId: string): Promise<number> =>
    this._newsCategoryRepository.count({slug, company: companyId});
}
