import { INews }                                         from '@modules/news/interfaces/news.interface';
import { IsArray, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { ApiProperty }                                   from '@nestjs/swagger';

export class CreateNewsDto implements Partial<INews> {
  @ApiProperty({
    description: 'News title headline',
    minLength: 3,
    maxLength: 100,
    type: String
  })
  @IsString()
  @Length(3, 100)
  headline: string;

  @ApiProperty({
    description: 'News slug, a unique identifier for the news article',
    minLength: 3,
    maxLength: 106,
    type: String
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'News abstract, a short description of the news article',
    minLength: 3,
    type: String
  })
  @IsString()
  @IsOptional()
  abstract?: string;

  @ApiProperty({
    description: 'News body, the main content of the news article',
    minLength: 50,
    type: String
  })
  @IsString()
  @Length(50)
  body: string;

  @IsString()
  @IsUUID()
  categoryId?: string;

  @IsArray()
  @IsOptional()
  images?: string[];
}
