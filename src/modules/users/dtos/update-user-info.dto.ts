import { IsString, Length, Matches } from 'class-validator';
import { ApiProperty }               from '@nestjs/swagger';
import { NAME_REGEX }                from '@common/consts/regex.const';

export class UpdateUserInfoDto {
  @ApiProperty({
    description: 'The new lastname',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Firstname must not have special characters',
  })
  public firstname: string;

  @ApiProperty({
    description: 'The new lastname',
    example: 'John Doe',
    type: String,
  })
  @IsString()
  @Length(3, 100)
  @Matches(NAME_REGEX, {
    message: 'Firstname must not have special characters',
  })
  public lastname: string;

  @ApiProperty({
    description: 'Birth date',
    example: '1990-01-01',
    type: String,
  })
  @IsString()
  public birthdate: string;

  @IsString()
  public city: string;

  @IsString()
  public country: string;

  @IsString()
  public gender: string;

  // @IsOptional()
  // @ValidateNested({each: true})
  // @Type(() => ContactDto)
  // public contacts?: ContactDto[];
}
