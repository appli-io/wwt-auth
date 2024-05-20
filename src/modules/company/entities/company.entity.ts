import { Collection, Entity, ManyToMany, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IsEmail, IsOptional, IsString, IsUrl, Length, Matches }           from 'class-validator';
import { v4 }                                                              from 'uuid';

import { NAME_REGEX, SLUG_REGEX } from '@common/consts/regex.const';
import { ICompany }               from '@modules/company/interfaces/company.interface';
import { CompanyUserEntity }      from '@modules/company-user/entities/company-user.entity';
import { UserEntity }             from '@modules/users/entities/user.entity';
import { IImage }                 from '@modules/news/interfaces/news.interface';

@Entity({tableName: 'companies'})
export class CompanyEntity implements ICompany {
  @PrimaryKey({columnType: 'uuid'})
  public id: string = v4();

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

  @Property({columnType: 'varchar', length: 255, nullable: true})
  @IsOptional()
  @IsString()
  @Length(5, 255)
  public description?: string;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @Length(3, 255)
  public nationalId: string;

  @Property({columnType: 'json', nullable: true})
  @IsOptional()
  public logo?: IImage;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email: string;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @IsUrl()
  @IsOptional()
  @Length(5, 255)
  public website: string;

  @Property({columnType: 'boolean', default: false})
  public isVerified: boolean;

  @Property({columnType: 'boolean', default: true})
  public isActive: boolean;

  @Property({columnType: 'varchar', length: 255})
  @IsString()
  @Length(2, 255)
  public country: string;

  @ManyToOne(() => UserEntity, {nullable: false})
  public owner: UserEntity;

  @ManyToMany({entity: () => UserEntity, pivotEntity: () => CompanyUserEntity})
  public users = new Collection<UserEntity>(this);

  @Property({onCreate: () => new Date()})
  public createdAt: Date = new Date();

  @Property({onUpdate: () => new Date(), nullable: true})
  public updatedAt: Date = new Date();
}
