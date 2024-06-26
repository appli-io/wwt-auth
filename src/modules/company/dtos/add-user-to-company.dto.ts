import { ApiProperty } from '@nestjs/swagger';

import { Enum }     from '@mikro-orm/core';
import { IsNumber } from 'class-validator';

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
  @Enum(() => RoleEnum)
  public role: RoleEnum;
}
