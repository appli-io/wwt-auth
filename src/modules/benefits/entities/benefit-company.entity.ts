import { Collection, Entity, EntityRepositoryType, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { FileEntity }                                                                                     from '@modules/firebase/entities/file.entity';
import { v4 }                                                                                             from 'uuid';
import { CompanyEntity }                                                                                  from '@modules/company/entities/company.entity';
import { CompanyUserEntity }                                                                              from '@modules/company-user/entities/company-user.entity';
import { BenefitCompanyRepository }                                                                       from '@modules/benefits/entities/repositories/benefit-company.repository';
import { BenefitEntity }                                                                                  from '@modules/benefits/entities/benefit.entity';

@Entity({tableName: 'benefit_companies', repository: () => BenefitCompanyRepository})
export class BenefitCompanyEntity {
  [EntityRepositoryType]?: BenefitCompanyRepository;

  @PrimaryKey({type: 'uuid'})
  id: string = v4();

  @Property()
  name!: string;

  @OneToOne({entity: () => FileEntity, nullable: true, eager: true})
  image?: FileEntity;

  @ManyToOne({entity: () => CompanyEntity})
  company!: CompanyEntity;

  @OneToMany({entity: () => BenefitEntity, mappedBy: 'benefitCompany', orphanRemoval: true})
  benefits = new Collection<BenefitEntity>(this);

  @ManyToOne({entity: () => CompanyUserEntity})
  createdBy!: CompanyUserEntity;
}
