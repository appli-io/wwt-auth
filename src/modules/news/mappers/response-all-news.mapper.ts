import { ApiProperty } from '@nestjs/swagger';

import { v4 } from 'uuid';

import { NewsEntity }               from '@modules/news/entities/news.entity';
import { INews }                    from '@modules/news/interfaces/news.interface';
import { ResponseSimpleUserMapper } from '@modules/users/mappers/response-simple-user.mapper';

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
  public portraitImage: string;
  @ApiProperty({
    description: 'Created by',
    example: '{fullname: "John Doe"}',
    type: Object,
  })
  public createdBy: ResponseSimpleUserMapper;
  @ApiProperty({
    description: 'Published date',
    example: new Date(),
    type: Date,
  })
  public publishedAt: Date;

  constructor(values: ResponseAllNewsMapper) {
    Object.assign(this, values);
  }

  public static map(news: NewsEntity): ResponseAllNewsMapper {
    return new ResponseAllNewsMapper({
      id: news.id,
      headline: news.headline,
      slug: news.slug,
      portraitImage: news.portraitImage,
      createdBy: ResponseSimpleUserMapper.map(news.createdBy),
      publishedAt: news.publishedAt,
    });
  }
}
