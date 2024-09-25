import { ApiProperty } from '@nestjs/swagger';

import { ContactDto } from '@modules/users/dtos/contact.dto';
import { UserEntity } from '@modules/users/entities/user.entity';

import { IUser }             from '../interfaces/user.interface';
import { IImage }            from '@modules/news/interfaces/news.interface';
import { CompanyUserMapper } from '@modules/auth/mappers/company-user.mapper';

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
    description: 'User firstname',
    example: 'John',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  public firstname: string;

  @ApiProperty({
    description: 'User lastname',
    example: 'Doe',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  public lastname: string;

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
    description: 'User gender',
    example: 'https://www.example.com/image.jpg',
    type: String
  })
  public gender: string;

  @ApiProperty({
    description: 'User birth date',
    example: '2024-01-01',
    type: String
  })
  public birthdate: string;


  @ApiProperty({
    description: 'User avatar',
    example: 'https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public avatar: IImage;

  @ApiProperty({
    description: 'User portrait image',
    example: 'https://www.example.com/image.jpg',
    type: String
  })
  public portrait: string;

  @ApiProperty({
    description: 'User\'s assigned company',
    minLength: 3,
    maxLength: 255,
    type: Object,
  })
  public companies: CompanyUserMapper[];

  @ApiProperty({
    description: 'User location',
    example: 'San Francisco, CA',
    minLength: 3,
    maxLength: 255,
    type: String,
  })
  public city: string;

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
      firstname: user.firstname,
      lastname: user.lastname,
      username: user.username,
      email: user.email,
      gender: user.gender,
      birthdate: user.birthdate,
      avatar: user.avatar,
      portrait: user.portrait,
      companies: user.companyUsers.isInitialized() && user.companyUsers.map(CompanyUserMapper.map),
      city: user.city,
      contacts: user.companyUsers.isInitialized() && user.companyUsers.map(cu => cu.contacts.isInitialized() && cu.contacts.map(c => ContactDto.fromEntity(c))).flat(),
    });
  }
}
