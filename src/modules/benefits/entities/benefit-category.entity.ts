import { Collection, Entity, EntityRepositoryType, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 }                                                                                             from 'uuid';
import { BenefitEntity }                                                                                  from '@modules/benefits/entities/benefit.entity';
import { FileEntity }                                                                                     from '@modules/firebase/entities/file.entity';
import { CompanyEntity }                                                                                  from '@modules/company/entities/company.entity';
import { CompanyUserEntity }                                                                              from '@modules/company-user/entities/company-user.entity';
import { BenefitCategoryViewEntity }                                                                      from '@modules/benefits/entities/benefit-category-view.entity';
import { BenefitCategoryRepository }                                                                      from '@modules/benefits/entities/repositories/benefit-category.repository';

@Entity({tableName: 'benefit_categories', repository: () => BenefitCategoryRepository})
export class BenefitCategoryEntity {

  [EntityRepositoryType]?: BenefitCategoryRepository;

  @PrimaryKey({type: 'uuid'})
  id: string = v4();

  @Property()
  name!: string;

  @Property()
  description!: string;

  @Property()
  active: boolean = true;

  @Property()
  order: number = 0;

  @OneToOne({entity: () => FileEntity, nullable: true})
  icon?: FileEntity;

  @OneToOne({entity: () => FileEntity, nullable: true})
  image?: FileEntity;

  @Property({type: 'json', nullable: true})
  metadata?: Record<string, any>;

  @ManyToOne(() => BenefitCategoryEntity, {nullable: true})
  parent?: BenefitCategoryEntity;

  @ManyToOne(() => CompanyEntity)
  company?: CompanyEntity;

  @ManyToOne(() => CompanyUserEntity)
  createdBy?: CompanyUserEntity;

  @OneToMany(() => BenefitCategoryEntity, category => category.parent)
  subCategories = new Collection<BenefitCategoryEntity>(this);

  @OneToMany(() => BenefitEntity, benefit => benefit.category)
  benefits = new Collection<BenefitEntity>(this);

  @OneToMany(() => BenefitCategoryViewEntity, view => view.benefitCategory)
  views = new Collection<BenefitCategoryViewEntity>(this);

  @Property()
  createdAt: Date = new Date();

  @Property({onUpdate: () => new Date()})
  updatedAt: Date = new Date();

  @Property({nullable: true})
  deletedAt?: Date;
}
