import { Injectable }        from '@nestjs/common';
import { InjectRepository }  from '@mikro-orm/nestjs';
import { EntityRepository }  from '@mikro-orm/core';
import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';

@Injectable()
export class MemberService {
  constructor(
    @InjectRepository(CompanyUserEntity) private readonly memberRepository: EntityRepository<CompanyUserEntity>,
  ) {}

  findAll() {
    return this.memberRepository.findAll();
  }

  findOne(userId: string, companyId: string) {
    return this.memberRepository.findOne({user: {id: userId}, company: {id: companyId}}, {populate: [ 'user' ]});
  }
}
