import { InjectRepository } from "@mikro-orm/nestjs";
import { Injectable } from "@nestjs/common";
import { CompanyUserInviteEntity } from "./entities/company-user-invite.entity";
import { EntityManager, EntityRepository } from "@mikro-orm/postgresql";
import { CompanyUserInviteQueryDto } from "./dtos/company-user-invite-query.dto";

@Injectable()
export class CompanyUserInviteService {
    constructor(
        @InjectRepository(CompanyUserInviteEntity) private readonly _companyUserInviteRepository: EntityRepository<CompanyUserInviteEntity>,
        private readonly _em: EntityManager,
    ) { }

    public async getByEmail(email: string) {
        return this._companyUserInviteRepository.findOne({ email });
    }

    public async getAll(companyId: string) {
        return this._companyUserInviteRepository.findAll({where: {company: {id: companyId}}});
    }


}