import { BenefitTypeEnum } from '@modules/benefits/enums/benefit-type.enum';

export class CreateBenefitDto {
  public title: string;
  public description: string;
  public requirements: string;
  public conditions: string;
  public discounts: Record<string, any>;
  public dueDate: Date;
  public type: BenefitTypeEnum;
  public categoryId: string;
}
