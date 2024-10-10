import { Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';

import { v4 } from 'uuid';

import { CompanyEntity } from '@modules/company/entities/company.entity';
import { ProductEntity } from '@modules/marketplace/entities/product.entity';

@Entity({tableName: 'marketplace_categories'})
export class CategoryEntity {
  @PrimaryKey({columnType: 'uuid'})
  public id: string = v4();

  @Property()
  public name: string;

  @Property()
  public description: string;

  @Property()
  public icon: string;

  @Property({columnType: 'boolean', default: true})
  public isActive: boolean = true;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt: Date;

  @ManyToOne({entity: () => CompanyEntity})
  public company: CompanyEntity;

  @ManyToOne({entity: () => CategoryEntity, nullable: true})
  public parent: CategoryEntity;

  @OneToMany({entity: () => CategoryEntity, mappedBy: (c) => c.parent})
  public children: CategoryEntity[];

  @OneToMany({entity: () => ProductEntity, mappedBy: (p) => p.category})
  public products: ProductEntity[];
}
