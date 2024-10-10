import { RoleEnum }                from '@modules/company-user/enums/role.enum';
import { CompanyUserInviteEntity } from '@modules/company-user/entities/company-user-invite.entity';

export class MemberInviteFullMapper {
  readonly id: string;
  readonly email: string;
  readonly role: RoleEnum;
  readonly position: string;
  readonly message: string;
  readonly token: string;
  readonly joined: boolean;
  readonly createdAt: Date;

  constructor(values: Partial<MemberInviteFullMapper>) {
    Object.assign(this, values);
  }

  static map(entity: CompanyUserInviteEntity): MemberInviteFullMapper {
    return new MemberInviteFullMapper({
      id: entity.id,
      email: entity.email,
      role: entity.role,
      position: entity.position,
      message: entity.message,
      token: entity.token,
      joined: entity.joined,
      createdAt: entity.createdAt
    });
  }

  static mapAll(entities: CompanyUserInviteEntity[]): MemberInviteFullMapper[] {
    return entities.map(entity => MemberInviteFullMapper.map(entity));
  }
}
