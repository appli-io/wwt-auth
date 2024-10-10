import { FileEntity }                    from '@modules/firebase/entities/file.entity';
import { BenefitTypeEnum }               from '@modules/benefits/enums/benefit-type.enum';
import { BenefitEntity }                 from '@modules/benefits/entities/benefit.entity';
import { BenefitCategorySelectorMapper } from '@modules/benefits/mappers/benefit-category-selector.mapper';
import { BenefitCompanySelectorMapper }  from '@modules/benefits/mappers/benefit-company-selector.mapper';

export class BenefitCompactMapper {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly image: FileEntity;
  readonly category: BenefitCategorySelectorMapper;
  readonly company: BenefitCompanySelectorMapper;
  readonly type: BenefitTypeEnum;
  readonly createdAt: Date;
  readonly dueDate: Date;

  constructor(values: Partial<BenefitCompactMapper>) {
    Object.assign(this, values);
  }

  static map(benefit: BenefitEntity): BenefitCompactMapper {
    return new BenefitCompactMapper({
      id: benefit.id,
      name: benefit.name,
      description: benefit.description,
      image: benefit.image,
      category: BenefitCategorySelectorMapper.map(benefit.category),
      company: BenefitCompanySelectorMapper.map(benefit.benefitCompany),
      type: benefit.type,
      createdAt: benefit.createdAt,
      dueDate: benefit.dueDate
    });
  }
}
