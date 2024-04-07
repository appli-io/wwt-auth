import { Collection, Entity, Enum, ManyToOne, OneToMany, Property, Unique } from '@mikro-orm/core';

import { IsOptional, IsString } from 'class-validator';

import { CompanyEntity }      from '@modules/company/entities/company.entity';
import { RoleEnum }           from '@modules/company-user/enums/role.enum';
import { UsersContactEntity } from '@modules/company-user/entities/users-contact.entity';
import { UserEntity }         from '@modules/users/entities/user.entity';

@Entity({tableName: 'company_user'})
@Unique({properties: [ 'user', 'company' ]})
export class CompanyUserEntity {
  @ManyToOne({primary: true, entity: () => UserEntity})
  public user: UserEntity;

  @ManyToOne({primary: true, entity: () => CompanyEntity})
  public company: CompanyEntity;

  @Property({columnType: 'boolean', default: true})
  public isActive: boolean;

  @Enum({items: () => RoleEnum, default: RoleEnum.USER})
  public role: RoleEnum;

  @Property({columnType: 'varchar', length: 255, nullable: true})
  @IsString()
  @IsOptional()
  public position?: string;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt?: Date;

  @OneToMany(() => UsersContactEntity, (contact) => contact.companyUser)
  public contacts = new Collection<UsersContactEntity>(this);
}
