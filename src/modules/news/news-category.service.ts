import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { NewsCategoryEntity } from '@modules/news/entities/news-category.entity';

@Injectable()
export class NewsCategoryService {
  constructor(
    @InjectRepository(NewsCategoryEntity) private readonly _newsCategoryRepository: EntityRepository<NewsCategoryEntity>
  ) {}

}
