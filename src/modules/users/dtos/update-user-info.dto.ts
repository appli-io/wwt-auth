import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateUserInfoDto {
  // Optional avatar field
  @IsString()
  @IsUrl()
  @IsOptional()
  public avatar?: string;

  // Optional position field
  @IsString()
  @IsOptional()
  public position?: string;

  // Optional location field
  @IsString()
  @IsOptional()
  public location?: string;
}
