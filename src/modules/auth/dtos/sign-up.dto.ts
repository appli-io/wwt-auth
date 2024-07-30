import { ApiProperty }                                                    from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Length, Matches, ValidateNested } from 'class-validator';
import { NAME_REGEX }                                                     from '@common/consts/regex.const';
import { PasswordsDto }                                                   from './passwords.dto';
import { CreateCompanyDto }                                               from '@modules/company/dtos/create-company.dto';
import { Type }                                                           from 'class-transformer';

export abstract class SignUpDto extends PasswordsDto {
  @ApiProperty({
    description: 'The user name',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  @IsString()
  @Length(3, 100, {
    message: 'Name has to be between 3 and 100 characters.',
  })
  @Matches(NAME_REGEX, {
    message: 'Name can only contain letters, dtos, numbers and spaces.',
  })
  public name!: string;

  @ApiProperty({
    description: 'The user email',
    example: 'example@gmail.com',
    minLength: 5,
    maxLength: 255,
    type: String,
  })
  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email!: string;

  @ApiProperty({
    description: 'The user token',
    example: '2f3b4c5d6e7f8g9h0i',
    minLength: 5,
    maxLength: 255,
    type: String,
  })
  @IsString()
  @Length(5, 255)
  @IsOptional()
  public token?: string;

  @ApiProperty({
    type: CreateCompanyDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCompanyDto)
  public company?: CreateCompanyDto;
}
