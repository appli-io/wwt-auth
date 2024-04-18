import { ApiProperty }        from '@nestjs/swagger';
import { NewsCategoryEntity } from '@modules/news/entities/news-category.entity';

export class ResponseAllNewsCategoriesMapper implements Partial<NewsCategoryEntity> {
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

  @ApiProperty({
    description: 'Category description',
    example: 'This is a category description',
    type: String,
  })
  public description: string;

  @ApiProperty({
    description: 'Category image',
    example: 'https://www.example.com/image.jpg',
    type: String,
  })
  public image: string;

  constructor(values: ResponseAllNewsCategoriesMapper) {
    Object.assign(this, values);
  }

  public static map(category: NewsCategoryEntity) {
    return new ResponseAllNewsCategoriesMapper({
      name: category.name,
      slug: category.slug,
      color: category.color,
      image: category.image,
      description: category.description,
    });
  }
}
