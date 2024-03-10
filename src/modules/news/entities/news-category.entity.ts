import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IsString, Length, Matches }               from 'class-validator';
import { INewsCategory }                           from '@modules/news/interfaces/news-category.interface';
import { SLUG_REGEX }                              from '@common/consts/regex.const';
import { UserEntity }                              from '@modules/users/entities/user.entity';

@Entity({tableName: 'news_category'})
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
  @IsString()
  public image: string;

  @Property({columnType: 'text'})
  @IsString()
  public color: string;

  @Property({columnType: 'varchar', length: 106})
  @IsString()
  @Length(3, 106)
  @Matches(SLUG_REGEX, {message: 'should be a valid slug'})
  public slug: string;

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public createdAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date()})
  public updatedAt: Date;

  @ManyToOne()
  public createdBy: UserEntity;

  @ManyToOne()
  public updatedBy: UserEntity;
}
