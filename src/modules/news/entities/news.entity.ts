import { Collection, Entity, ManyToOne, OneToMany, OneToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { IsString, Length, Matches }                                                from 'class-validator';
import { v4 }                                                                       from 'uuid';

import { SLUG_REGEX }         from '@common/consts/regex.const';
import { CompanyEntity }      from '@modules/company/entities/company.entity';
import { FileEntity }         from '@modules/firebase/entities/file.entity';
import { NewsCategoryEntity } from '@modules/news/entities/news-category.entity';
import { INews }              from '@modules/news/interfaces/news.interface';
import { UserEntity }         from '@modules/users/entities/user.entity';

@Entity({tableName: 'news'})
export class NewsEntity implements INews {
  @PrimaryKey({columnType: 'uuid'})
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

  @Property({columnType: 'timestamptz', onCreate: () => new Date()})
  public publishedAt: Date;

  @Property({columnType: 'timestamptz', onUpdate: () => new Date(), nullable: true})
  public updatedAt?: Date;

  @Property({columnType: 'boolean', default: false})
  public isDeleted: boolean;

  @OneToMany(() => FileEntity, file => file.news, {nullable: true})
  public images = new Collection<FileEntity>(this);

  @OneToOne({entity: () => FileEntity, nullable: true})
  public portraitImage?: FileEntity;

  @ManyToOne(() => NewsCategoryEntity, {nullable: false})
  public category: NewsCategoryEntity;

  @ManyToOne(() => CompanyEntity, {nullable: false})
  public company: CompanyEntity;

  @ManyToOne({entity: () => UserEntity, nullable: false})
  public createdBy: UserEntity;

  @ManyToOne({entity: () => UserEntity, nullable: true})
  public updatedBy?: UserEntity;
}
