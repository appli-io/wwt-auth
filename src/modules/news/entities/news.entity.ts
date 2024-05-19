import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IsString, Length, Matches }               from 'class-validator';

import { SLUG_REGEX }         from '@common/consts/regex.const';
import { CompanyEntity }      from '@modules/company/entities/company.entity';
import { NewsCategoryEntity } from '@modules/news/entities/news-category.entity';
import { INews, INewsImage }  from '@modules/news/interfaces/news.interface';
import { UserEntity }         from '@modules/users/entities/user.entity';
import { v4 }                 from 'uuid';

@Entity({tableName: 'news'})
export class NewsEntity implements INews {
  @PrimaryKey()
  public id: string = v4();

  @Property({columnType: 'text'})
  @IsString()
  public headline: string;

  @Property({columnType: 'varchar', length: 106})
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {message: 'Headline must be a valid slug'})
  public slug: string;

  @Property({columnType: 'text'})
  @IsString()
  public abstract: string;

  @Property({columnType: 'text'})
  @IsString()
  public body: string;

  // For images, the columnType is json as we want to store an array
  @Property({columnType: 'json', nullable: true})
  public images?: INewsImage[];

  @Property({columnType: 'json', nullable: true})
  public portraitImage?: INewsImage;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public publishedAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt?: Date;

  @Property({columnType: 'boolean', default: false})
  public isDeleted: boolean;

  @ManyToOne(() => NewsCategoryEntity, {nullable: false})
  public category: NewsCategoryEntity;

  @ManyToOne(() => CompanyEntity, {nullable: false})
  public company: CompanyEntity;

  @ManyToOne({entity: () => UserEntity, nullable: false})
  public createdBy: UserEntity;

  @ManyToOne({entity: () => UserEntity, nullable: true})
  public updatedBy?: UserEntity;
}
