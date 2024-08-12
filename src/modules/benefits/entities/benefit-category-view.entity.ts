import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 }                                      from 'uuid';

import { BenefitCategoryEntity } from '@modules/benefits/entities/benefit-category.entity';

@Entity({tableName: 'benefit_category_view'})
export class BenefitCategoryViewEntity {
  @PrimaryKey({type: 'uuid'})
  public id: string = v4();

  @Property({type: 'timestamptz'})
  public timestamp: number;

  @ManyToOne({entity: () => BenefitCategoryEntity, inversedBy: 'views'})
  public benefitCategory!: BenefitCategoryEntity;
}
