import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';

export class MemberCompactMapper {
  readonly id: string;
  readonly name: string;
  readonly firstname: string;
  readonly lastname: string;
  readonly email: string;
  readonly position: string;

  constructor(values: Partial<MemberCompactMapper>) {
    Object.assign(this, values);
  }

  static map(entity: CompanyUserEntity) {
    return new MemberCompactMapper({
      id: entity.user.id,
      name: entity.user.name,
      firstname: entity.user.firstname,
      lastname: entity.user.lastname,
      email: entity.user.email,
      position: entity.position
    });
  }

  static mapAll(entities: CompanyUserEntity[]) {
    return entities.map(entity => MemberCompactMapper.map(entity));
  }
}
