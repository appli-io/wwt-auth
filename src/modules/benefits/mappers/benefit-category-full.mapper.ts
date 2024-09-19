import { ResponseFileMapper }           from '@modules/firebase/mappers/response-file.mapper';
import { BenefitCategoryEntity }        from '@modules/benefits/entities/benefit-category.entity';
import { BenefitCategoryCompactMapper } from '@modules/benefits/mappers/benefit-category-compact.mapper';

export class BenefitCategoryFullMapper extends BenefitCategoryCompactMapper {
  readonly metadata: Record<string, any>;
  readonly subCategories: BenefitCategoryCompactMapper[];

  constructor(values: Partial<BenefitCategoryFullMapper>) {
    super(values);
    Object.assign(this, values);
  }

  public static map(category: BenefitCategoryEntity): BenefitCategoryFullMapper {
    return new BenefitCategoryFullMapper({
      id: category.id,
      name: category.name,
      description: category.description,
      active: category.active,
      order: category.order,
      metadata: category.metadata,
      icon: category.icon ? ResponseFileMapper.map(category.icon) : undefined,
      image: category.image ? ResponseFileMapper.map(category.image) : undefined,
      parent: category.parent ? BenefitCategoryCompactMapper.map(category.parent) : undefined,
      subCategories: category.subCategories.isInitialized() ? category.subCategories.getSnapshot().map(category => BenefitCategoryCompactMapper.map(category, true)) : []
    });
  }
}
