import { ApiProperty }             from '@nestjs/swagger';
import { IAuthResponseUser }       from '../interfaces/auth-response-user.interface';
import { ResponsePositionsMapper } from '@modules/auth/mappers/response-positions.mapper';
import { UserEntity }              from '@modules/users/entities/user.entity';
import { CompanyEntity }           from '@modules/company/entities/company.entity';
import { v4 }                      from 'uuid';

export class AuthResponseUserMapper implements IAuthResponseUser {
  @ApiProperty({
    description: 'User id',
    example: 123,
    minimum: 1,
    type: Number,
  })
  public id: number;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  public name: string;

  @ApiProperty({
    description: 'User username',
    example: 'john.doe1',
    minLength: 3,
    maxLength: 106,
    type: String,
  })
  public username: string;

  @ApiProperty({
    description: 'User avatar',
    example: 'uploads/user-avatars/<USER_ID>/' + v4() + '.png',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public avatar: string;

  @ApiProperty({
    description: 'User email',
    example: 'example@gmail.com',
    minLength: 5,
    maxLength: 255,
  })
  public email: string;

  @ApiProperty({
    description: 'User settings',
    example: {},
    type: Object,
  })
  public settings: Record<string, any>;

  @ApiProperty({
    description: 'User companies',
    example: [],
    type: Array,
  })
  public assignedCompanies: Partial<CompanyEntity>[];

  @ApiProperty({
    description: 'User position by company',
    example: {
      companyId: '123e4567-e89b-12d3-a456-426614174000',
      position: 'Software Engineer'
    }
  })
  public positions?: ResponsePositionsMapper[];

  @ApiProperty({
    description: 'User location',
    example: 'San Francisco, CA',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public location: string;

  constructor(values: IAuthResponseUser) {
    Object.assign(this, values);
  }

  public static map(user: UserEntity): AuthResponseUserMapper {
    return new AuthResponseUserMapper({
      id: user.id,
      name: user.name,
      username: user.username,
      avatar: user.avatar,
      email: user.email,
      positions: user.companyUsers.map(ResponsePositionsMapper.map),
      assignedCompanies: user.assignedCompanies.map((company) => ({
        id: company.id,
        name: company.name,
        username: company.username,
        logo: company.logo
      } as Partial<CompanyEntity>)),
      settings: user.settings,
      location: user.location,
    });
  }
}
