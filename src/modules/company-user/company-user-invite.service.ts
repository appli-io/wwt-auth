import { CompanyUserInviteEntity }                          from "./entities/company-user-invite.entity";
import { CreateCompanyUserInviteDto }                       from "./dtos/create-company-user-invite.dto";
import { CommonService }                                    from "@common/common.service";
import { EntityRepository }                                 from "@mikro-orm/postgresql";
import { Injectable }                                       from "@nestjs/common";
import { InjectRepository }                                 from "@mikro-orm/nestjs";

@Injectable()
export class CompanyUserInviteService {
    constructor(
        @InjectRepository(CompanyUserInviteEntity) private readonly inviteRepository: EntityRepository<CompanyUserInviteEntity>,
        private readonly commonService: CommonService
    ) { }

    public async getByEmail(email: string) {
        return this.inviteRepository.findOne({ email });
    }

    public async getAll(companyId: string) {
        return this.inviteRepository.find({ company: { id: companyId } });
    }

    public async create(createInviteDto: CreateCompanyUserInviteDto, companyId: string, userId: string): Promise<CompanyUserInviteEntity> {
        const invite = this.inviteRepository.create({
            ...createInviteDto,
            company: companyId,
            createdBy: userId,
            createdAt: new Date(),
            updatedAt: new Date(),
            joined: false
        });
        await this.commonService.saveEntity(invite, true);
        return invite;
    }
}
