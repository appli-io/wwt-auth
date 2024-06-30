import { Collection, Entity, Enum, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';

import { v4 } from 'uuid';

import { CompanyUserEntity }  from '@modules/company-user/entities/company-user.entity';
import { CompanyEntity }      from '@modules/company/entities/company.entity';
import { CategoryEntity }     from '@modules/marketplace/entities/category.entity';
import { ProductStatus }      from '@modules/marketplace/enums/product-status.enum';
import { ProductImageEntity } from '@modules/marketplace/entities/product-image.entity';
import { ImageEntity }        from '@modules/images/entities/image.entity';

@Entity({tableName: 'marketplace_products'})
export class ProductEntity {
  @PrimaryKey({columnType: 'uuid'})
  public id: string = v4();

  @Property()
  public name: string;

  @Property({columnType: 'text', length: 500})
  public description: string;

  @Property()
  public price: number;

  @Property()
  public currency: string;

  @Property()
  public quantity: number;

  @Property()
  public location: string;

  @Enum({items: () => ProductStatus, default: ProductStatus.DRAFT})
  public status: ProductStatus;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt: Date;

  @ManyToOne({entity: () => CategoryEntity})
  public category: CategoryEntity;

  @ManyToOne({entity: () => CompanyUserEntity})
  public seller: CompanyUserEntity;

  @ManyToOne({entity: () => CompanyEntity})
  public company: CompanyEntity;

  @OneToMany({entity: () => ProductImageEntity, mappedBy: (i) => i.product})
  public images = new Collection<ImageEntity>(this);
}
