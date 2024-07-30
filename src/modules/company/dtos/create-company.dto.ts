import { ApiProperty }                                           from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUrl, Length, Matches } from 'class-validator';
import { NAME_REGEX }                                            from '@common/consts/regex.const';
import { ICompany }                                              from '@modules/company/interfaces/company.interface';

export class CreateCompanyDto implements Partial<ICompany> {
  @ApiProperty({
    description: 'Company name',
    minLength: 3,
    maxLength: 100,
    type: String
  })
  @IsString()
  @Length(3, 100, {message: 'Name has to be between 3 and 100 characters.',})
  @Matches(NAME_REGEX, {
    message: 'Name can only contain letters, dtos, numbers and spaces.',
  })
  public name!: string;

  // @ApiProperty({
  //   description: 'The username',
  //   minLength: 3,
  //   maxLength: 100,
  //   type: String,
  //   pattern: SLUG_REGEX.source
  // })
  // @IsString()
  // @Length(3, 100, {
  //   message: 'Username has to be between 3 and 100 characters.',
  // })
  // @Matches(SLUG_REGEX, {
  //   message: 'Username can only contain letters, dtos, numbers and spaces.',
  // })
  // public username!: string;

  @ApiProperty({
    description: 'Company national ID',
    minLength: 3,
    maxLength: 100,
    type: String
  })
  @IsString()
  @Length(3, 100, {message: 'Name has to be between 3 and 255 characters.',})
  public nationalId!: string;

  @ApiProperty({
    description: 'Company description',
    minLength: 3,
    maxLength: 255,
    type: String
  })
  @IsString()
  @IsOptional()
  @Length(3, 100, {message: 'Description has to be between 3 and 255 characters.',})
  public description?: string;

  @ApiProperty({
    description: 'Company email',
    minLength: 3,
    maxLength: 255,
    type: String
  })
  @IsString()
  @IsEmail({}, {message: 'Invalid email format.'})
  @Length(5, 255)
  @IsOptional()
  public email: string;

  @ApiProperty({
    description: 'Company website',
    minLength: 3,
    maxLength: 255,
    type: String
  })
  @IsString()
  @IsUrl()
  @IsOptional()
  public website: string;

  @IsString()
  @Length(2, 100)
  public country: string;
}
