import { NewsCategoryEntity } from '@modules/news/entities/news-category.entity';

export class ResponseNewsCategoriesSelectorMapper {
  public value: string;
  public label: string;

  constructor(values: ResponseNewsCategoriesSelectorMapper) {
    Object.assign(this, values);
  }

  static map(entity: NewsCategoryEntity): ResponseNewsCategoriesSelectorMapper {
    return new ResponseNewsCategoriesSelectorMapper({
      value: entity.id,
      label: entity.name
    });
  }
}
