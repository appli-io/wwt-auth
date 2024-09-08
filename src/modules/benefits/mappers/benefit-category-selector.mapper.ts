import { BenefitCategoryEntity } from '@modules/benefits/entities/benefit-category.entity';

export class BenefitCategorySelectorMapper {
  readonly id: string;
  readonly name: string;
  readonly parent?: BenefitCategorySelectorMapper;

  constructor(values: Partial<BenefitCategorySelectorMapper>) {
    Object.assign(this, values);
  }

  public static map(category: BenefitCategoryEntity): BenefitCategorySelectorMapper {
    return new BenefitCategorySelectorMapper({
      id: category.id,
      name: category.name,
      parent: category.parent ? BenefitCategorySelectorMapper.map(category.parent) : undefined,
    });
  }
}
