import { Entity, ManyToOne, PrimaryKey, Property, Unique } from '@mikro-orm/core';

import { IsString, IsUrl, Length, Matches } from 'class-validator';

import { SLUG_REGEX }    from '@common/consts/regex.const';
import { CompanyEntity } from '@modules/company/entities/company.entity';
import { INewsCategory } from '@modules/news/interfaces/news-category.interface';
import { UserEntity }    from '@modules/users/entities/user.entity';

@Entity({tableName: 'news_category'})
@Unique({properties: [ 'slug', 'company' ]})
export class NewsCategoryEntity implements INewsCategory {
  @PrimaryKey({columnType: 'uuid'})
  public id: string;

  @Property({columnType: 'text'})
  @IsString()
  public name: string;

  @Property({columnType: 'text'})
  @IsString()
  public description: string;

  @Property({columnType: 'text'})
  @IsUrl()
  public image: string;

  @Property({columnType: 'text'})
  @IsString()
  public color: string;

  @Property({columnType: 'varchar', length: 106})
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {message: 'should be a valid slug'})
  public slug: string;

  @ManyToOne(() => CompanyEntity, {nullable: false, name: 'company_id'})
  public company: CompanyEntity;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date()})
  public updatedAt: Date;

  @ManyToOne(() => UserEntity)
  public createdBy: UserEntity;

  @ManyToOne(() => UserEntity)
  public updatedBy: UserEntity;
}
