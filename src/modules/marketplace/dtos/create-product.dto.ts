import { ProductStatus }                                                  from '@modules/marketplace/enums/product-status.enum';
import { CategoryEntity }                                                 from '@modules/marketplace/entities/category.entity';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  public description: string;

  @IsNumber()
  @Min(0)
  public price: number;

  @IsString()
  @IsNotEmpty()
  public currency: string;

  @Min(0)
  public quantity: number;

  @IsString()
  @IsNotEmpty()
  public location: string;

  @IsEnum(ProductStatus)
  public status: ProductStatus;

  @IsUUID()
  @IsNotEmpty()
  public category: CategoryEntity['id'];
}
