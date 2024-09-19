import { Cascade, Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { BenefitCategoryEntity } from '@modules/benefits/entities/benefit-category.entity';
import { BenefitCompanyEntity }  from '@modules/benefits/entities/benefit-company.entity';
import { BenefitTypeEnum }       from '@modules/benefits/enums/benefit-type.enum';
import { FileEntity }            from '@modules/firebase/entities/file.entity';
import { v4 }                    from 'uuid';
import { BenefitLocationEntity } from '@modules/benefits/entities/benefit-location.entity';
import { BenefitViewEntity }     from '@modules/benefits/entities/benefit-view.entity';
import { CompanyEntity }         from '@modules/company/entities/company.entity';
import { CompanyUserEntity }     from '@modules/company-user/entities/company-user.entity';

@Entity({tableName: 'benefits'})
export class BenefitEntity {
  @PrimaryKey({type: 'uuid'})
  id: string = v4();

  @Property()
  name!: string;

  @Property({type: 'text'})
  description!: string;

  @Property({type: 'text', nullable: true})
  requirements?: string;

  @Property({type: 'text', nullable: true})
  conditions?: string;

  @Property({type: 'json', nullable: true})
  discounts?: Record<string, any>;

  @Property({type: 'date', nullable: true})
  dueDate?: Date;

  @Enum({items: () => BenefitTypeEnum})
  type!: BenefitTypeEnum;

  @OneToOne({entity: () => FileEntity, nullable: true, eager: true})
  image?: FileEntity;

  @ManyToOne(() => BenefitCategoryEntity, {cascade: [ Cascade.PERSIST ]})
  category!: BenefitCategoryEntity;

  @ManyToOne(() => BenefitCompanyEntity)
  benefitCompany!: BenefitCompanyEntity;

  @ManyToOne(() => CompanyEntity)
  company!: CompanyEntity;

  @ManyToOne(() => CompanyUserEntity)
  createdBy!: CompanyUserEntity;

  @OneToMany(() => BenefitLocationEntity, location => location.benefit)
  locations = new Collection<BenefitLocationEntity>(this);

  @OneToMany(() => BenefitViewEntity, view => view.benefit)
  views = new Collection<BenefitViewEntity>(this);

  @Property({onCreate: () => new Date()})
  createdAt: Date = new Date();

  @Property({onUpdate: () => new Date(), nullable: true})
  updatedAt: Date = new Date();
}
