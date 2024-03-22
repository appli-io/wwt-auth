import { Entity, Enum, ManyToOne, Property, Unique } from '@mikro-orm/core';

import { CompanyEntity } from '@modules/company/entities/company.entity';
import { RoleEnum }      from '@modules/company-user/enums/role.enum';
import { UserEntity }    from '@modules/users/entities/user.entity';

@Entity({tableName: 'company_user'})
@Unique({properties: [ 'user', 'company' ]})
export class CompanyUserEntity {
  @ManyToOne({primary: true, entity: () => UserEntity})
  public user: UserEntity;

  @ManyToOne({primary: true, entity: () => CompanyEntity})
  public company: CompanyEntity;

  @Property({columnType: 'boolean', default: true})
  public active: boolean;

  @Enum({items: () => RoleEnum, default: RoleEnum.USER})
  public role: RoleEnum;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt?: Date;
}
