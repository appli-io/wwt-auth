import { ApiProperty } from '@nestjs/swagger';

import { IsEnum, IsNumber } from 'class-validator';

import { RoleEnum } from '@modules/company-user/enums/role.enum';

export class AddUserToCompanyDto {
  @ApiProperty({
    description: 'User ID',
    type: String,
  })
  @IsNumber()
  public userId: string;

  @ApiProperty({
    description: 'Role selected for the user',
    type: String,
    enum: RoleEnum,
  })
  @IsEnum(RoleEnum)
  public role: RoleEnum;
}
