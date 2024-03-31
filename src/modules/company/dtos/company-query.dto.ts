import { ICompany }             from '@modules/company/interfaces/company.interface';
import { ApiProperty }          from '@nestjs/swagger';
import { Transform, Type }      from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class CompanyQueryDto implements Partial<ICompany> {
  @ApiProperty({
    description: 'Company ID',
    type: String
  })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({
    description: 'Company name',
    type: String
  })
  @IsString()
  @IsOptional()
  @Transform(({value}) => value.toLowerCase())
  name?: string;

  @ApiProperty({
    description: 'Company username',
    type: String
  })
  @IsString()
  @IsOptional()
  @Transform(({value}) => value.toLowerCase())
  username?: string;

  @ApiProperty({
    description: 'Company national ID',
    type: String
  })
  @IsString()
  @IsOptional()
  nationalId?: string;

  @ApiProperty({
    description: 'Company email',
    type: String
  })
  @IsString()
  @IsOptional()
  @Transform(({value}) => value.toLowerCase())
  email?: string;

  @ApiProperty({
    description: 'Company active status',
    type: Boolean
  })
  @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Company verified status',
    type: Boolean
  })
  @Type(() => Boolean)
  @IsOptional()
  isVerified?: boolean;

  @ApiProperty({
    description: 'Company country',
    type: String
  })
  @IsString()
  @IsOptional()
  country?: string;
}
