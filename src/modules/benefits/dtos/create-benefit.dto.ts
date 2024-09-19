import { BenefitTypeEnum }                                        from '@modules/benefits/enums/benefit-type.enum';
import { IsDate, IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateBenefitDto {
  @IsString()
  public name: string;

  @IsString()
  public description: string;

  @IsString()
  @IsOptional()
  public requirements: string;

  @IsString()
  @IsOptional()
  public conditions: string;

  @IsObject()
  @IsOptional()
  public discounts: Record<string, any>;

  @IsDate()
  @IsOptional()
  public dueDate: Date;

  @IsEnum(BenefitTypeEnum)
  public type: BenefitTypeEnum;

  @IsUUID()
  public categoryId: string;

  @IsUUID()
  public companyId: string;

  // Internal use only
  image?: Express.Multer.File;
}
