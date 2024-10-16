import { ApiProperty }                                   from '@nestjs/swagger';
import { RoleEnum }                                      from '../enums/role.enum';
import { Transform }                                     from 'class-transformer';
import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export class CreateCompanyUserInviteDto {

  @ApiProperty({
    description: 'The email of the user to be invited',
    type: String,
  })
  @IsEmail()
  @Length(1, 255)
  public email!: string;

  @IsEnum(RoleEnum)
  @Transform(({value}) => value.toLowerCase())
  @IsOptional()
  public role?: RoleEnum;

  @ApiProperty({
    description: 'The position of the user',
    type: String,
  })
  @IsString()
  @Length(1, 255)
  public position!: string;

  @ApiProperty({
    description: 'The message to be sent to the user',
    type: String,
  })
  @IsString()
  @Length(1)
  public message!: string;

}
