import { ResponseFileMapper }    from '@modules/firebase/mappers/response-file.mapper';
import { BenefitCategoryEntity } from '@modules/benefits/entities/benefit-category.entity';

export class BenefitCategoryFullMapper {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly active: boolean;
  readonly order: number;
  readonly metadata: Record<string, any>;
  readonly icon?: ResponseFileMapper;
  readonly image?: ResponseFileMapper;
  readonly parent?: BenefitCategoryFullMapper;

  constructor(values: Partial<BenefitCategoryFullMapper>) {
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
      parent: category.parent ? BenefitCategoryFullMapper.map(category.parent) : undefined,
    });
  }
}
