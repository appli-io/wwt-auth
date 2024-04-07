import { IsOptional, IsString, IsUrl, ValidateNested } from 'class-validator';
import { Type }                                        from 'class-transformer';

import { ContactDto } from '@modules/users/dtos/contact.dto';

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

  // Optional bio contact info field array
  @IsOptional()
  @ValidateNested({each: true})
  @Type(() => ContactDto)
  public contacts?: ContactDto[];
}
