import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 }                                      from 'uuid';
import { BenefitEntity }                           from '@modules/benefits/entities/benefit.entity';

@Entity({tableName: 'benefit_locations'})
export class BenefitLocationEntity {
  @PrimaryKey({type: 'uuid'})
  id: string = v4();

  @Property()
  branchName!: string;

  @Property()
  brand!: string;

  @Property()
  address!: string;

  @Property()
  city!: string;

  @Property()
  province!: string;

  @Property()
  latitude!: string;

  @Property()
  longitude!: string;

  @ManyToOne(() => BenefitEntity)
  benefit!: BenefitEntity;

  @Property()
  createdAt: Date = new Date();

  @Property({onUpdate: () => new Date()})
  updatedAt: Date = new Date();
}
