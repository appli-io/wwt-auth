import { BenefitCategoryEntity } from '@modules/benefits/entities/benefit-category.entity';

export class BenefitCategoryCompactMapper {
  readonly id: string;
  readonly name: string;
  readonly parent?: BenefitCategoryCompactMapper;

  constructor(values: Partial<BenefitCategoryCompactMapper>) {
    Object.assign(this, values);
  }

  public static map(category: BenefitCategoryEntity): BenefitCategoryCompactMapper {
    return new BenefitCategoryCompactMapper({
      id: category.id,
      name: category.name,
      parent: category.parent ? BenefitCategoryCompactMapper.map(category.parent) : undefined,
    });
  }
}
