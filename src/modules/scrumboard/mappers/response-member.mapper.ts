import { ResponseSimpleUserMapper } from '@modules/users/mappers/response-simple-user.mapper';
import { CompanyUserEntity }        from '@modules/company-user/entities/company-user.entity';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export class ResponseMemberMapper extends ResponseSimpleUserMapper {
  public position: string;

  constructor(values: ResponseMemberMapper) {
    super(values);
    Object.assign(this, values);
  }

  static map(companyUserEntity: CompanyUserEntity): ResponseMemberMapper {
    return new ResponseMemberMapper({
      id: companyUserEntity.user.id,
      name: companyUserEntity.user.name,
      username: companyUserEntity.user.username,
      avatar: companyUserEntity.user.avatar,
      position: companyUserEntity.position
    });
  }

  static mapAll(companyUserEntities: CompanyUserEntity[]): ResponseMemberMapper[] {
    return companyUserEntities.map(ResponseMemberMapper.map);
  }
}
