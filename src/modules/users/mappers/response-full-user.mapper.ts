import { ApiProperty } from '@nestjs/swagger';

import { ContactDto } from '@modules/users/dtos/contact.dto';
import { UserEntity } from '@modules/users/entities/user.entity';

import { IUser }                   from '../interfaces/user.interface';
import { ResponsePositionsMapper } from '@modules/auth/mappers/response-positions.mapper';

export class ResponseFullUserMapper implements Partial<IUser> {
  @ApiProperty({
    description: 'User id',
    example: 123,
    minimum: 1,
    type: String,
  })
  public id: string;

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
    description: 'User portrait image',
    example: 'https://www.example.com/image.jpg',
    type: String
  })
  public portrait: string;

  @ApiProperty({
    description: 'User positions by company',
    minLength: 3,
    maxLength: 255,
    type: Object,
  })
  public positions: ResponsePositionsMapper[];

  @ApiProperty({
    description: 'User location',
    example: 'San Francisco, CA',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public location: string;

  @ApiProperty({
    description: 'User contacts',
  })
  public contacts: ContactDto[];

  constructor(values: ResponseFullUserMapper) {
    Object.assign(this, values);
  }

  public static map(user: UserEntity): ResponseFullUserMapper {
    return new ResponseFullUserMapper({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      avatar: user.avatar,
      portrait: user.portrait,
      positions: user.companyUsers.map(ResponsePositionsMapper.map),
      location: user.location,
      contacts: user.companyUsers.map(cu => cu.contacts.map(c => ContactDto.fromEntity(c))).flat(),
    });
  }
}
