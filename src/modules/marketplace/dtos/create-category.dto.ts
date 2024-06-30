import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  public name: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  public description: string;

  @IsString()
  @IsNotEmpty()
  public icon: string;

  @IsUUID()
  @IsOptional()
  public parent: string;
}
