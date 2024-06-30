import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { v4 }            from 'uuid';
import { ProductEntity } from '@modules/marketplace/entities/product.entity';

@Entity({tableName: 'marketplace_product_images'})
export class ProductImageEntity {
  @PrimaryKey({columnType: 'uuid'})
  public id: string = v4();

  @Property()
  public fileId: string;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt: Date;

  @ManyToOne({entity: () => ProductEntity, fieldName: 'product_id'})
  public product: ProductEntity;
}
