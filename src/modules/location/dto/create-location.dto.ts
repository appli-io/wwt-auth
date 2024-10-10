import { IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class CreateLocationDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ValidateNested({each: true})
  children: CreateLocationDto[];
}
