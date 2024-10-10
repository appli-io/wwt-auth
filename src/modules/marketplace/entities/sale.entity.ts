import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { v4 } from 'uuid';

import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { ProductEntity }     from '@modules/marketplace/entities/product.entity';

@Entity()
export class SaleEntity {
  @PrimaryKey({columnType: 'uuid'})
  public id: string = v4();

  @Property()
  public price: number;

  @Property()
  public currency: string;

  @Property()
  public quantity: number;

  @Property()
  public total: number;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt?: Date;

  @ManyToOne({entity: () => ProductEntity})
  public product: ProductEntity;

  @ManyToOne({entity: () => CompanyUserEntity})
  public buyer: CompanyUserEntity;

  @ManyToOne({entity: () => CompanyUserEntity})
  public seller: CompanyUserEntity;
}
