import { ApiProperty } from '@nestjs/swagger';

import { ContactDto } from '@modules/users/dtos/contact.dto';
import { UserEntity } from '@modules/users/entities/user.entity';

import { IUser } from '../interfaces/user.interface';

export class ResponseFullUserMapper implements Partial<IUser> {
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
    description: 'User email',
    example: 'john.doe1@email.com',
    minLength: 3,
    maxLength: 106,
    type: String,
  })
  public email: string;

  @ApiProperty({
    description: 'User avatar',
    example: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public avatar: string;

  @ApiProperty({
    description: 'User positions by company',
    minLength: 3,
    maxLength: 255,
    type: Object,
  })
  public positions: {
    position: string,
    companyId: string,
  }[];

  @ApiProperty({
    description: 'User location',
    example: 'San Francisco, CA',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public location: string;

  @ApiProperty({
    description: 'User settings',
    example: {},
    type: Object,
  })
  public settings: Record<string, any>;

  @ApiProperty({
    description: 'User contacts',
  })
  public contacts: ContactDto[];

  constructor(values: ResponseFullUserMapper) {
    Object.assign(this, values);
  }

  public static map(user: UserEntity, companyPosition?: string): ResponseFullUserMapper {
    return new ResponseFullUserMapper({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      positions: user.companyUsers.map((companyUser) => ({position: companyUser.position, companyId: companyUser.company.id})),
      location: user.location,
      settings: user.settings,
      contacts: user.companyUsers.map(cu => cu.contacts.map(c => ContactDto.fromEntity(c))).flat(),
    });
  }
}
