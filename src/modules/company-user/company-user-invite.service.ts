import { CompanyUserInviteEntity }    from './entities/company-user-invite.entity';
import { CreateCompanyUserInviteDto } from './dtos/create-company-user-invite.dto';
import { CommonService }              from '@common/common.service';
import { EntityRepository }           from '@mikro-orm/postgresql';
import { Injectable }                 from '@nestjs/common';
import { InjectRepository }           from '@mikro-orm/nestjs';
import { RoleEnum }                   from '@modules/company-user/enums/role.enum';
import { nanoid }                     from 'nanoid';

@Injectable()
export class CompanyUserInviteService {
  constructor(
    @InjectRepository(CompanyUserInviteEntity) private readonly inviteRepository: EntityRepository<CompanyUserInviteEntity>,
    private readonly commonService: CommonService
  ) { }

  public async getByEmail(email: string) {
    return this.inviteRepository.findOne({email});
  }

  public async getByToken(token: string) {
    return this.inviteRepository.findOne({token});
  }

  public async getAll(companyId: string) {
    return this.inviteRepository.find({company: {id: companyId}});
  }

  public async create(createInviteDto: CreateCompanyUserInviteDto, companyId: string, userId: string): Promise<CompanyUserInviteEntity> {
    if (!createInviteDto.role) createInviteDto.role = RoleEnum.USER;

    const invite = this.inviteRepository.create({
      ...createInviteDto,
      company: companyId,
      createdBy: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
      joined: false,
      token: 'WWT_' + nanoid(20)
    });
    await this.commonService.saveEntity(invite, true);
    return invite;
  }

  public async updateJoined(invite: CompanyUserInviteEntity) {
    invite.joined = true;
    await this.commonService.saveEntity(invite, false);
  }
}
