import { Collection, Entity, Enum, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { BenefitCategoryEntity } from '@modules/benefits/entities/benefit-category.entity';
import { BenefitCompanyEntity }  from '@modules/benefits/entities/benefit-company.entity';
import { BenefitTypeEnum }       from '@modules/benefits/enums/benefit-type.enum';
import { FileEntity }            from '@modules/firebase/entities/file.entity';
import { v4 }                    from 'uuid';
import { BenefitLocationEntity } from '@modules/benefits/entities/benefit-location.entity';

@Entity({tableName: 'benefits'})
export class BenefitEntity {
  @PrimaryKey({type: 'uuid'})
  id: string = v4();

  @Property()
  title!: string;

  @Property({type: 'text'})
  description!: string;

  @Property({type: 'text'})
  requirements!: string;

  @Property({type: 'text'})
  conditions!: string;

  @Property({type: 'json'})
  discounts: Record<string, any> = {};

  @Property({type: 'date'})
  dueDate!: Date;

  @Enum({items: () => BenefitTypeEnum})
  type!: BenefitTypeEnum;

  @OneToOne({entity: () => FileEntity, nullable: true})
  public image?: FileEntity;

  @ManyToOne(() => BenefitCompanyEntity)
  company!: BenefitCompanyEntity;

  @ManyToOne(() => BenefitCategoryEntity)
  category!: BenefitCategoryEntity;

  @OneToMany(() => BenefitLocationEntity, location => location.benefit)
  locations = new Collection<BenefitLocationEntity>(this);

  @Property({onCreate: () => new Date()})
  public createdAt: Date = new Date();

  @Property({onUpdate: () => new Date(), nullable: true})
  public updatedAt: Date = new Date();
}
