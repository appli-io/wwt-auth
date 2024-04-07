import { ApiProperty }        from '@nestjs/swagger';
import { NewsCategoryEntity } from '@modules/news/entities/news-category.entity';

export class ResponseNewsCategoryMapper implements Partial<NewsCategoryEntity> {
  @ApiProperty({
    description: 'Category name',
    example: 'Science And Technology',
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Category color',
    example: '#000000',
    type: String,
  })
  public color: string;

  @ApiProperty({
    description: 'Category slug',
    example: 'science-technology',
    type: String,
  })
  public slug: string;

  constructor(values: ResponseNewsCategoryMapper) {
    Object.assign(this, values);
  }

  public static map(category: NewsCategoryEntity) {
    return new ResponseNewsCategoryMapper({
      name: category.name,
      slug: category.slug,
      color: category.color,
    });
  }
}
