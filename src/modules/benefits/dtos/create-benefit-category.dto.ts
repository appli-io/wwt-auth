import { ApiProperty } from '@nestjs/swagger';

import { IsNumber, IsObject, IsOptional, IsString, IsUUID, Length, MinLength } from 'class-validator';

export class CreateBenefitCategoryDto {
  @ApiProperty({
    description: 'Category name',
    type: String
  })
  @IsString()
  @Length(3, 100)
  public name: string;

  @ApiProperty({
    description: 'Category description',
    type: String
  })
  @IsString()
  @MinLength(10)
  public description: string;

  @ApiProperty({
    description: 'Category order to show',
    type: Number
  })
  @IsOptional()
  @IsNumber()
  public order: number;

  @ApiProperty({
    description: 'Category metadata',
    type: Object,
    required: false
  })
  @IsOptional()
  @IsObject()
  public metadata: Record<string, any>;

  @ApiProperty({
    description: 'Parent category id',
    type: String,
    required: false
  })
  @IsOptional()
  @IsUUID()
  public parent?: string;

  // Internal use only
  public icon: Express.Multer.File;
  public image: Express.Multer.File;
}
