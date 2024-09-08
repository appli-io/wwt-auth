import { EntityRepository }      from '@mikro-orm/postgresql';
import { BenefitCategoryEntity } from '@modules/benefits/entities/benefit-category.entity';

export class BenefitCategoryRepository extends EntityRepository<BenefitCategoryEntity> {
  countByNameAndParent = (name: string, parentId: string, companyId: string): Promise<number> => this.count({
    name,
    parent: {id: parentId},
    company: {id: companyId}
  });
}
