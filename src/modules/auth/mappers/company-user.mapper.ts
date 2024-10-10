import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { FileEntity }        from '@modules/firebase/entities/file.entity';

export class CompanyUserMapper {
  public id: string;
  public name: string;
  public username: string;
  public logo: FileEntity;
  public position: string;

  constructor(values: CompanyUserMapper) {
    Object.assign(this, values);
  }

  public static map(companyUser: CompanyUserEntity): CompanyUserMapper {
    return new CompanyUserMapper({
      id: companyUser.company.id,
      name: companyUser.company.name,
      username: companyUser.company.username,
      logo: companyUser.company.logo,
      position: companyUser.position,
    });
  }
}
