import { Cascade, Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 }                                               from 'uuid';
import { BenefitEntity }                                    from '@modules/benefits/entities/benefit.entity';

@Entity({tableName: 'benefit_view'})
export class BenefitViewEntity {
  @PrimaryKey({type: 'uuid'})
  public id: string = v4();

  @Property({type: 'timestamptz'})
  public timestamp: Date;

  @ManyToOne({entity: () => BenefitEntity, inversedBy: 'views', cascade: [ Cascade.REMOVE ]})
  public benefit!: BenefitEntity;
}
