import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 }                                      from 'uuid';
import { BenefitEntity }                           from '@modules/benefits/entities/benefit.entity';
import { BenefitCompanyEntity }                    from '@modules/benefits/entities/benefit-company.entity';
import { BenefitCategoryEntity }                   from '@modules/benefits/entities/benefit-category.entity';
import { CompanyEntity }                           from '@modules/company/entities/company.entity';

@Entity({tableName: 'benefit_locations'})
export class BenefitLocationEntity {
  @PrimaryKey({type: 'uuid'})
  id: string = v4();

  @Property()
  branchName!: string;

  @ManyToOne(() => BenefitEntity)
  benefit!: BenefitEntity;

  @ManyToOne(() => BenefitCategoryEntity)
  benefitCompany!: BenefitCompanyEntity;

  @ManyToOne(() => CompanyEntity)
  company!: CompanyEntity;

  @Property()
  createdAt: Date = new Date();

  @Property({onUpdate: () => new Date()})
  updatedAt: Date = new Date();
}
