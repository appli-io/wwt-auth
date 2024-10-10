import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { v4 }                                                             from 'uuid';

@Entity({tableName: 'administrative_units'})
export class AdministrativeUnitEntity {
  @PrimaryKey({type: 'uuid'})
  id: string = v4();

  @Property()
  name!: string;

  @Property({nullable: true})
  code: string;

  @Property()
  type!: string; // 'country', 'region', 'province', 'city', etc.

  @Property()
  level!: number; // 1 for country, 2 for first subdivision, 3 for second, etc.

  @Property({nullable: true})
  latitude?: string;

  @Property({nullable: true})
  longitude?: string;

  @ManyToOne(() => AdministrativeUnitEntity, {nullable: true})
  parent?: AdministrativeUnitEntity;

  @OneToMany(() => AdministrativeUnitEntity, unit => unit.parent)
  children = new Collection<AdministrativeUnitEntity>(this);

  @Property({type: 'json', nullable: true})
  metadata?: Record<string, any>;

  @Property()
  createdAt: Date = new Date();

  @Property({onUpdate: () => new Date()})
  updatedAt: Date = new Date();
}
