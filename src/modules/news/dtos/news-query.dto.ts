import { ApiProperty }                            from '@nestjs/swagger';
import { INews }                                  from '@modules/news/interfaces/news.interface';
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';

export class NewsQueryDto implements Partial<INews> {
  @ApiProperty({
    description: 'News ID',
    type: String
  })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'News headline',
    type: String
  })
  @IsString()
  @IsOptional()
  headline?: string;

  @ApiProperty({
    description: 'News slug',
    type: String
  })
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiProperty({
    description: 'Author ID',
    type: Number
  })
  @IsNumber()
  @IsOptional()
  authorId?: number;

  @ApiProperty({
    description: 'Author name',
    type: String
  })
  @IsString()
  @IsOptional()
  authorName?: string;
}
