import { ResponseFileMapper } from '@modules/firebase/mappers/response-file.mapper';
import { ContactDto }         from '@modules/users/dtos/contact.dto';
import { CompanyUserEntity }  from '@modules/company-user/entities/company-user.entity';

export class UserContactFullMapper {
  readonly id: string;
  readonly name: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly username: string;
  readonly email: string;
  readonly gender: string;
  readonly birthdate: string;
  readonly avatar: ResponseFileMapper;
  readonly portrait: ResponseFileMapper;
  readonly location: string;
  readonly city: string;
  readonly country: string;
  readonly bio: string;

  // CompanyUser fields
  readonly position: string;
  readonly contacts: ContactDto[];

  constructor(values: Partial<UserContactFullMapper>) {
    Object.assign(this, values);
  }

  static map(entity: CompanyUserEntity): UserContactFullMapper {
    return new UserContactFullMapper({
      id: entity.user.id,
      name: entity.user.name,
      firstname: entity.user.firstname,
      lastname: entity.user.lastname,
      username: entity.user.username,
      email: entity.user.email,
      gender: entity.user.gender,
      birthdate: entity.user.birthdate,
      avatar: entity.user.avatar && ResponseFileMapper.map(entity.user.avatar),
      portrait: entity.user.portrait && ResponseFileMapper.map(entity.user.portrait),
      location: entity.user.location,
      city: entity.user.city,
      country: entity.user.country,
      bio: entity.user.bio,

      position: entity.position,
      contacts: entity.contacts?.map(ContactDto.fromEntity)
    });
  }
}
