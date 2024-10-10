import { ApiProperty } from '@nestjs/swagger';
import { v4 }          from 'uuid';

import { FileEntity }                      from '@modules/firebase/entities/file.entity';
import { ResponseFileMapper }              from '@modules/firebase/mappers/response-file.mapper';
import { NewsEntity }                      from '@modules/news/entities/news.entity';
import { INews }                           from '@modules/news/interfaces/news.interface';
import { ResponseAllNewsCategoriesMapper } from '@modules/news/mappers/response-all-news-categories.mapper';
import { ResponseSimpleUserMapper }        from '@modules/users/mappers/response-simple-user.mapper';

export class ResponseFullNewsMapper implements Partial<INews> {
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
  public portraitImage: FileEntity;

  @ApiProperty({
    description: 'image',
    example: 'https://www.example.com/image.jpg',
    type: [ Object ],
  })
  public images: ResponseFileMapper[];

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

  @ApiProperty({
    description: 'Body',
    example: 'This is the body of the news',
    type: String,
  })
  public body: Record<string, unknown>;

  constructor(values: ResponseFullNewsMapper) {
    Object.assign(this, values);
  }

  public static map(news: NewsEntity): ResponseFullNewsMapper {
    return new ResponseFullNewsMapper({
      id: news.id,
      headline: news.headline,
      abstract: news.abstract,
      slug: news.slug,
      body: news.body,
      portraitImage: news.portraitImage,
      images: news.images.getItems().map(ResponseFileMapper.map),
      category: ResponseAllNewsCategoriesMapper.map(news.category),
      createdBy: ResponseSimpleUserMapper.map(news.createdBy),
      publishedAt: news.publishedAt,
      deletedAt: news.deletedAt,
    });
  }
}
