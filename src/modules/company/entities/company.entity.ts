import { Entity, ManyToOne, PrimaryKey, Property }              from '@mikro-orm/core';
import { IsBoolean, IsEmail, IsString, IsUrl, Length, Matches } from 'class-validator';

import { NAME_REGEX, SLUG_REGEX } from '@common/consts/regex.const';
import { ICompany }               from '@modules/company/interfaces/company.interface';
import { UserEntity }             from '@modules/users/entities/user.entity';

@Entity({tableName: 'companies'})
export class CompanyEntity implements ICompany {
  @PrimaryKey({type: 'uuid'})
  public id: string;

  @Property({columnType: 'varchar', length: 100})
  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Name must not have special characters',
  })
  public name: string;

  // slug is a unique identifier for a company
  @Property({columnType: 'varchar', length: 106})
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {
    message: 'Username must be a valid slugs',
  })
  public username: string;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @Length(5, 255)
  public description: string;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @Length(5, 255)
  public nationalId: string;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @IsUrl()
  @Length(5, 255)
  public logo: string;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email: string;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @IsUrl()
  @Length(5, 255)
  public website: string;

  @ManyToOne(() => UserEntity, {nullable: false})
  public owner: UserEntity;

  @Property({columnType: 'boolean', default: false})
  @IsBoolean()
  public isVerified: boolean;

  @Property({columnType: 'boolean', default: true})
  @IsBoolean()
  public isActive: boolean;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @Length(2, 255)
  public country: string;

  @Property({onCreate: () => new Date()})
  public createdAt: Date = new Date();

  @Property({onUpdate: () => new Date()})
  public updatedAt: Date = new Date();
}
