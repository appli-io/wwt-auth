import { INewsCategory }      from '@modules/news/interfaces/news-category.interface';
import { NewsCategoryEntity } from '@modules/news/entities/news-category.entity';

export class ResponseFullNewsCategoryMapper implements Partial<INewsCategory> {
  public id: string;
  public name: string;
  public description: string;
  public image: string;
  public color: string;
  public slug: string;
  public createdAt: Date;
  public updatedAt: Date;

  constructor(values: ResponseFullNewsCategoryMapper) {
    Object.assign(this, values);
  }

  static map(values: NewsCategoryEntity): ResponseFullNewsCategoryMapper {
    return new ResponseFullNewsCategoryMapper({
      id: values.id,
      name: values.name,
      description: values.description,
      image: values.image,
      color: values.color,
      slug: values.slug,
      createdAt: values.createdAt,
      updatedAt: values.updatedAt,
    });
  }
}
