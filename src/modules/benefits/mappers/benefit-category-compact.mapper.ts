import { ResponseFileMapper }    from '@modules/firebase/mappers/response-file.mapper';
import { BenefitCategoryEntity } from '@modules/benefits/entities/benefit-category.entity';

export class BenefitCategoryCompactMapper {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly active: boolean;
  readonly order: number;
  readonly icon?: ResponseFileMapper;
  readonly image?: ResponseFileMapper;
  readonly category?: BenefitCategoryCompactMapper;
  readonly parent?: BenefitCategoryCompactMapper;

  constructor(values: Partial<BenefitCategoryCompactMapper>) {
    Object.assign(this, values);
  }

  public static map(category: BenefitCategoryEntity, inner: boolean = false): BenefitCategoryCompactMapper {
    return new BenefitCategoryCompactMapper({
      id: category.id,
      name: category.name,
      description: category.description,
      active: category.active,
      order: category.order,
      icon: category.icon ? ResponseFileMapper.map(category.icon) : undefined,
      image: category.image ? ResponseFileMapper.map(category.image) : undefined,
      parent: inner
        ? category.parent
        : category.parent
          ? BenefitCategoryCompactMapper.map(category.parent, true)
          : undefined
    });
  }
}
