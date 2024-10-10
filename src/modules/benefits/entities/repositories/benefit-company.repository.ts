import { EntityRepository }     from '@mikro-orm/postgresql';
import { BenefitCompanyEntity } from '@modules/benefits/entities/benefit-company.entity';

export class BenefitCompanyRepository extends EntityRepository<BenefitCompanyEntity> {
  countByName = (name: string, companyId: string): Promise<number> => this.count({
    name,
    company: {id: companyId}
  });
}
