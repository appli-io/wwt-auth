import { ApiProperty } from '@nestjs/swagger';

import { v4 } from 'uuid';

import { NewsEntity }                      from '@modules/news/entities/news.entity';
import { IImage, INews }                   from '@modules/news/interfaces/news.interface';
import { ResponseAllNewsCategoriesMapper } from '@modules/news/mappers/response-all-news-categories.mapper';
import { ResponseSimpleUserMapper }        from '@modules/users/mappers/response-simple-user.mapper';

export class ResponseAllNewsMapper implements Partial<INews> {
  @ApiProperty({
    description: 'News id',
    example: v4(),
    type: String,
  })
  public id: string;

  @ApiProperty({
    description: 'News headline',
    example: 'Breaking news',
    type: String,
  })
  public headline: string;

  @ApiProperty({
    description: 'News abstract',
    example: 'This is a breaking news article',
    type: String,
  })
  public abstract: string;

  @ApiProperty({
    description: 'News slug',
    example: 'breaking-news',
    type: String,
  })
  public slug: string;

  @ApiProperty({
    description: 'Portrait image',
    example: 'https://www.example.com/image.jpg',
    type: String,
  })
  public portraitImage: IImage;

  @ApiProperty({
    description: 'Category',
    example: 'Science And Technology',
    type: Object,
  })
  public category: ResponseAllNewsCategoriesMapper;

  @ApiProperty({
    description: 'Created by',
    type: Object,
  })
  public createdBy: ResponseSimpleUserMapper;

  @ApiProperty({
    description: 'Published date',
    example: new Date(),
    type: Date,
  })
  public publishedAt: Date;

  @ApiProperty({
    description: 'Deleted date',
    example: new Date(),
    type: Date,
  })
  public deletedAt: Date;

  constructor(values: ResponseAllNewsMapper) {
    Object.assign(this, values);
  }

  public static map(news: NewsEntity): ResponseAllNewsMapper {
    return new ResponseAllNewsMapper({
      id: news.id,
      headline: news.headline,
      abstract: news.abstract,
      slug: news.slug,
      portraitImage: news.portraitImage,
      category: ResponseAllNewsCategoriesMapper.map(news.category),
      createdBy: ResponseSimpleUserMapper.map(news.createdBy),
      publishedAt: news.publishedAt,
      deletedAt: news.deletedAt,
    });
  }
}
