import { ApiProperty } from '@nestjs/swagger';

import { IsDate, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Transform, Type }                      from 'class-transformer';

import { RoleEnum } from '@modules/company-user/enums/role.enum';

export class MembersQueryDto {
  @ApiProperty({
    description: 'Member id',
    example: 1,
    type: Number,
  })
  @IsNumber()
  @IsOptional()
  public memberId?: number;

  @ApiProperty({
    description: 'Role',
    example: 'user',
    enum: RoleEnum,
    type: String,
  })
  @IsEnum(RoleEnum)
  @Transform(({value}) => value.toLowerCase())
  @IsOptional()
  public role?: RoleEnum;

  @ApiProperty({
    description: 'Is active',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  public isActive?: boolean;

  @ApiProperty({
    description: 'Created from',
    example: '2021-10-10T00:00:00Z',
    type: Date,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  public createdFrom?: Date;
}
