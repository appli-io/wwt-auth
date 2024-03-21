import { ApiProperty } from '@nestjs/swagger';
import { v4 }          from 'uuid';

import { ICompanyResponse }   from '@modules/company/interfaces/company-response.interface';
import { CompanyEntity }      from '@modules/company/entities/company.entity';
import { ResponseUserMapper } from '@modules/users/mappers/response-user.mapper';
import { IUser }              from '@modules/users/interfaces/user.interface';

export class ResponseCompanyMapper implements ICompanyResponse {
  @ApiProperty({
    description: 'Company id',
    example: v4(),
    type: String,
  })
  public id: string;

  @ApiProperty({
    description: 'Company name',
    example: 'Company name',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'Company username',
    example: 'company.username',
    minLength: 3,
    maxLength: 106,
    type: String,
  })
  public username: string;

  @ApiProperty({
    description: 'Company description',
    example: 'Company description',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public description: string;

  @ApiProperty({
    description: 'Company national id',
    example: '123456789',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public nationalId: string;

  @ApiProperty({
    description: 'Company logo',
    example: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public logo: string;

  @ApiProperty({
    description: 'Company email',
    example: 'email@email.com',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public email: string;

  @ApiProperty({
    description: 'Company website',
    example: 'https://www.website.com',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public website: string;

  @ApiProperty({
    description: 'Company owner',
    example: 'User',
    type: Object,
  })
  public owner: ResponseUserMapper;

  @ApiProperty({
    description: 'Company users',
    example: 'User',
    type: [ Object ],
  })
  public users: ResponseUserMapper[];

  @ApiProperty({
    description: 'Company is verified',
    example: true,
    type: Boolean,
  })
  public isVerified: boolean;

  @ApiProperty({
    description: 'Company is active',
    example: true,
    type: Boolean,
  })
  public isActive: boolean;

  @ApiProperty({
    description: 'Company country',
    example: 'US',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public country: string;

  @ApiProperty({
    description: 'Company created at',
    example: new Date(),
    type: Date,
  })
  public createdAt: Date;

  constructor(values: ICompanyResponse) {
    Object.assign(this, values);
  }

  public static map(company: CompanyEntity): ResponseCompanyMapper {
    return new ResponseCompanyMapper({
      id: company.id,
      name: company.name,
      username: company.username,
      description: company.description,
      nationalId: company.nationalId,
      logo: company.logo,
      email: company.email,
      website: company.website,
      owner: ResponseUserMapper.map(company.owner),
      users: company.users.map((user: IUser) => ResponseUserMapper.map(user)),
      isVerified: company.isVerified,
      isActive: company.isActive,
      country: company.country,
      createdAt: company.createdAt,
    });
  }
}
