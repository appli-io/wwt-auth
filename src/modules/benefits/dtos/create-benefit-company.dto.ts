import { IsString } from 'class-validator';

export class CreateBenefitCompanyDto {
  @IsString()
  name: string;

  // internal use only
  image?: Express.Multer.File;
}
