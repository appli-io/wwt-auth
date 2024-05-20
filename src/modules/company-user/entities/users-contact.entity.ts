import { Entity, Enum, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';

import { IsEnum } from 'class-validator';
import { v4 }     from 'uuid';

import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { ContactTypeEnum }   from '@modules/users/enums/contact-type.enum';

@Entity({tableName: 'users_contact'})
@Unique({properties: [ 'companyUser', 'value', 'type' ]})
export class UsersContactEntity {
  @PrimaryKey({columnType: 'uuid'})
  public id: string = v4();

  @Property({columnType: 'text'})
  public value: string;

  @Property({columnType: 'text'})
  public label: string;

  @Enum({
    items: () => ContactTypeEnum,
    default: ContactTypeEnum.EMAIL,
  })
  @IsEnum(ContactTypeEnum)
  public type: ContactTypeEnum;

  @ManyToOne({entity: () => CompanyUserEntity, nullable: false})
  public companyUser!: CompanyUserEntity;
}
