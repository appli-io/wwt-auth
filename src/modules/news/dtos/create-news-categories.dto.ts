import { ApiProperty } from '@nestjs/swagger';

import { IsOptional, IsString, IsUrl, Matches } from 'class-validator';

import { NAME_REGEX, SLUG_REGEX } from '@common/consts/regex.const';
import { NewsCategoryEntity }     from '@modules/news/entities/news-category.entity';

export class CreateNewsCategoriesDto implements Partial<NewsCategoryEntity> {
  @ApiProperty({
    description: 'Category name',
    example: 'Science And Technology',
    type: String
  })
  @IsString()
  @Matches(NAME_REGEX, {message: 'Name must not have special characters'})
  name: string;

  @ApiProperty({
    description: 'Category description',
    example: 'Science And Technology news articles',
    type: String
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Category slug',
    example: 'science-technology',
    type: String
  })
  @IsString()
  @IsOptional()
  @Matches(SLUG_REGEX, {message: 'The slug must only contain lowercase letters, numbers, and can include dots, dashes, or underscores to separate words. It should not start or end with a special character, and there must not be consecutive special characters'})
  slug: string;

  @ApiProperty({
    description: 'Category image',
    example: 'https://example.com/image.jpg',
    type: String
  })
  @IsUrl()
  @IsOptional()
  image: string;

  @ApiProperty({
    description: 'Category color',
    example: '#000000',
    type: String
  })
  @IsString()
  @IsOptional()
  color: string;
}
