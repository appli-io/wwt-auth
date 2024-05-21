import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { RoleEnum }          from '@modules/company-user/enums/role.enum';
import { UserEntity }        from '@modules/users/entities/user.entity';

export class ResponseCompanyMemberMapper implements Partial<CompanyUserEntity>, Partial<UserEntity> {
  public id: string;
  public name: string;
  public username: string;
  public email: string;
  public avatar: string;
  public role: RoleEnum;
  public isActive: boolean;
  public createdAt: Date;

  constructor(values: ResponseCompanyMemberMapper) {
    Object.assign(this, values);
  }

  public static map(member: CompanyUserEntity): ResponseCompanyMemberMapper {
    return new ResponseCompanyMemberMapper({
      id: member.user.id,
      name: member.user.name,
      username: member.user.username,
      email: member.user.email,
      avatar: member.user.avatar,
      role: member.role,
      isActive: member.isActive,
      createdAt: member.createdAt,
    });
  }
}
