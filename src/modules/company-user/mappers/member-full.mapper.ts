import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { RoleEnum }          from '@modules/company-user/enums/role.enum';
import { UserEntity }        from '@modules/users/entities/user.entity';
import { FileEntity }        from '@modules/firebase/entities/file.entity';

export class MemberFullMapper implements Partial<CompanyUserEntity>, Partial<UserEntity> {
  public id: string;
  public name: string;
  public username: string;
  public email: string;
  public avatar: FileEntity;
  public role: RoleEnum;
  public position: string;
  public isActive: boolean;
  public createdAt: Date;

  constructor(values: MemberFullMapper) {
    Object.assign(this, values);
  }

  public static map(member: CompanyUserEntity): MemberFullMapper {
    return new MemberFullMapper({
      id: member.user.id,
      name: member.user.name,
      username: member.user.username,
      email: member.user.email,
      avatar: member.user.avatar,
      role: member.role,
      position: member.position,
      isActive: member.isActive,
      createdAt: member.createdAt,
    });
  }
}
