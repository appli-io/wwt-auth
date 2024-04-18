import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';

export class ResponsePositionsMapper {
  public position: string;
  public companyId: string;

  constructor(values: ResponsePositionsMapper) {
    Object.assign(this, values);
  }

  public static map(companyUser: CompanyUserEntity): ResponsePositionsMapper {
    return new ResponsePositionsMapper({
      position: companyUser.position,
      companyId: companyUser.company.id,
    });
  }
}
