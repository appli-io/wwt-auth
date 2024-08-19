import { IsString } from 'class-validator';

export class CreateBenefitCompanyDto {
  @IsString()
  name: string;
}
