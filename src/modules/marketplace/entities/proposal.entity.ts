import { Entity, Enum, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';

import { v4 } from 'uuid';

import { ProductEntity }     from '@modules/marketplace/entities/product.entity';
import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { ProposalStatus }    from '@modules/marketplace/enums/proposal-status.enum';

@Entity({tableName: 'marketplace_proposals'})
export class ProposalEntity {
  @PrimaryKey({columnType: 'uuid'})
  public id: string = v4();

  @Property({columnType: 'text', length: 500, nullable: true})
  public negotiation?: string;

  @Property()
  public contactEmail: string;

  @Property()
  public contactPhone: string;

  @Enum({items: () => ProposalStatus, default: ProposalStatus.PENDING})
  public status: ProposalStatus;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt: Date;

  @Property({nullable: true})
  public acceptedAt?: Date;

  @Property({nullable: true})
  public rejectedAt?: Date;

  @ManyToOne({entity: () => ProductEntity})
  public product: ProductEntity;

  @ManyToOne({entity: () => CompanyUserEntity})
  public buyer: CompanyUserEntity;

  @ManyToOne({entity: () => CompanyUserEntity})
  public seller: CompanyUserEntity;
}
