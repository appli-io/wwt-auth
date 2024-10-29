import { EntityRepository } from '@mikro-orm/postgresql';
import { NewsEntity }       from '@modules/news/entities/news.entity';
import { CompanyEntity }    from '@modules/company/entities/company.entity';

export class NewsRepository extends EntityRepository<NewsEntity> {
  findAllByCategoryId(categoryId: string, companyId: CompanyEntity['id']): Promise<NewsEntity[]> {
    return this.find({
      category: {id: categoryId},
      company: {id: companyId}
    });
  }
}
