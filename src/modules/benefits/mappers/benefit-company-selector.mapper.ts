import { BenefitCompanyEntity } from '@modules/benefits/entities/benefit-company.entity';
import { FileEntity }           from '@modules/firebase/entities/file.entity';

export class BenefitCompanySelectorMapper {
  readonly id: string;
  readonly name: string;
  readonly image: FileEntity;

  constructor(values: Partial<BenefitCompanySelectorMapper>) {
    Object.assign(this, values);
  }

  public static map(company: BenefitCompanyEntity): BenefitCompanySelectorMapper {
    return new BenefitCompanySelectorMapper({
      id: company.id,
      name: company.name,
      image: company.image,
    });
  }
}
