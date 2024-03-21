import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { INews }                                   from '@modules/news/interfaces/news.interface';
import { IsString, Length, Matches }               from 'class-validator';
import { SLUG_REGEX }                              from '@common/consts/regex.const';
import { NewsCategoryEntity }                      from '@modules/news/entities/news-category.entity';
import { UserEntity }                              from '@modules/users/entities/user.entity';
import { CompanyEntity }                           from '@modules/company/entities/company.entity';

@Entity({tableName: 'news'})
export class NewsEntity implements INews {
  @PrimaryKey({columnType: 'uuid'})
  public id: string;

  @Property({columnType: 'text'})
  @IsString()
  public headline: string;

  @Property({columnType: 'varchar', length: 106})
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {message: 'Username must be a valid slug'})
  public slug: string;

  @Property({columnType: 'text'})
  @IsString()
  public abstract: string;

  @Property({columnType: 'text'})
  @IsString()
  public body: string;

  // For images, the columnType is json as we want to store an array
  @Property({columnType: 'json'})
  public images: string[];

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public publishedAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date()})
  public updatedAt: Date;

  @ManyToOne(() => NewsCategoryEntity, {nullable: false})
  public category: NewsCategoryEntity;

  @ManyToOne(() => CompanyEntity, {nullable: false})
  public company: CompanyEntity;

  @ManyToOne({entity: () => UserEntity, nullable: false})
  public createdBy: UserEntity;

  @ManyToOne()
  public updatedBy: UserEntity;
}
