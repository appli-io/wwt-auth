import { ConflictException, Injectable, Logger, LoggerService, NotFoundException } from '@nestjs/common';

import { EntityManager, QBFilterQuery } from '@mikro-orm/core';
import { InjectRepository }             from '@mikro-orm/nestjs';
import { EntityRepository }             from '@mikro-orm/postgresql';

import { CommonService }               from '@common/common.service';
import { Page, Pageable, PageFactory } from '@lib/pageable';
import { AddUserToCompanyDto }         from '@modules/company/dtos/add-user-to-company.dto';
import { CompanyUserEntity }           from '@modules/company-user/entities/company-user.entity';
import { RoleEnum }                    from '@modules/company-user/enums/role.enum';
import { MembersQueryDto }             from '@modules/company/dtos/members-query.dto';
import { CompanyUserInviteService }    from '@modules/company-user/company-user-invite.service';
import { UserEntity }                  from '@modules/users/entities/user.entity';

@Injectable()
export class CompanyUserService {
  private readonly loggerService: LoggerService;

  constructor(
    @InjectRepository(CompanyUserEntity) private readonly _userCompanyRepository: EntityRepository<CompanyUserEntity>,
    public readonly _companyUserInviteService: CompanyUserInviteService,
    public readonly _em: EntityManager,
    private readonly _commonService: CommonService,
  ) {
    this.loggerService = new Logger(CompanyUserService.name);
  }

  public async getMembers(companyId: string, query: MembersQueryDto, pageable: Pageable) {
    const whereClause: QBFilterQuery<CompanyUserEntity> = { company: { id: { $eq: companyId } } };

    whereClause.user = {};
    if (query.memberId) whereClause.user = { ...whereClause.user, id: { $eq: query.memberId } };
    if (query.name) whereClause.user = {...whereClause.user, name: {$ilike: `%${ query.name }%`}};
    if (query.email) whereClause.user = {...whereClause.user, email: {$ilike: `%${ query.email }%`}};
    if (query.role) whereClause.role = { $eq: query.role };
    if (query.isActive) whereClause.isActive = { $eq: query.isActive };
    if (query.createdFrom) whereClause.createdAt = { $gte: query.createdFrom };

    const users: Page<CompanyUserEntity> = await new PageFactory(
      pageable,
      this._userCompanyRepository,
      {
        where: whereClause,
        relations: [
          {
            property: 'user',
            andSelect: true
          },
          {
            property: 'user.avatar',
            andSelect: true,
            type: 'leftJoin'
          }
        ]
      }
    ).create();

    return users;
  }

  public async findOne(userId: string, companyId: string) {
    return this._userCompanyRepository.findOne({ user: userId, company: companyId });
  }

  public async getUserAssignedCompanies(userId: string) {
    return this._userCompanyRepository.find({ user: userId });
  }

  public async assignCompanyToUser(companyId: string, { userId, role }: AddUserToCompanyDto) {
    const isUserInCompany: boolean = await this.isUserInCompany(companyId, userId);

    if (isUserInCompany) throw new ConflictException('User is already in company');

    const userCompany = this._userCompanyRepository.create({
      user: userId,
      company: companyId,
      role: role,
      isActive: true,
    });

    await this._commonService.saveEntity(userCompany, true);
  }

  public async validateTokenAndUsersEmail(token: string, email: string) {
    if (!token) return;

    const invite = await this._companyUserInviteService.getByToken(token);

    if (!invite) throw new NotFoundException('INVITE_NOT_FOUND');
    if (invite.joined) throw new ConflictException('INVITE_ALREADY_USED');
    if (invite.email !== email) throw new ConflictException('TOKEN_EMAIL_MISMATCH');
  }

  public async assignCompanyToUserByInviteToken(token: string, user: UserEntity) {
    const invite = await this._companyUserInviteService.getByToken(token);

    const userCompany = this._userCompanyRepository.create({
      user: user.id,
      company: invite.company.id,
      role: invite.role,
      position: invite.position,
      isActive: true,
    });

    await this._commonService.saveEntity(userCompany, true);
    await this._companyUserInviteService.updateJoined(invite);

    return userCompany;
  }

  public async removeCompanyFromUser(companyId: string, userId: string): Promise<boolean> {
    this.loggerService.log('Removing company from user');

    const userCompany = await this._userCompanyRepository.findOneOrFail({ user: userId, company: companyId })
      .catch(() => {
        throw new NotFoundException('Member not found in company');
      });

    await this._commonService.removeEntity(userCompany);

    return true;
  }

  public async disableUserInCompany(companyId: string, userId: string): Promise<boolean> {
    this.loggerService.log('Disabling user in company');

    const userCompany = await this._userCompanyRepository.findOneOrFail({ user: userId, company: companyId })
      .catch(() => {
        throw new NotFoundException('Member not found in company');
      });

    userCompany.isActive = false;

    await this._commonService.saveEntity(userCompany);

    return true;
  }

  public async getUserRole(companyId: string, userId: string, requiredRoles: RoleEnum[]) {
    const qb = this._userCompanyRepository
      .getEntityManager()
      .createQueryBuilder(CompanyUserEntity);

    qb.where({ user: userId, company: companyId });

    if (requiredRoles.length > 1) qb.andWhere({ role: { $in: requiredRoles } });

    const results = await qb.select('role').execute();
    const roles: RoleEnum[] = results.map(result => result.role);

    return roles;
  }

  public isUserInCompany = (companyId: string, userId: string) =>
    this._userCompanyRepository.count({ user: userId, company: companyId })
      .then(userCompany => userCompany > 0);

  public async isActiveUserInCompanies(id: string, companiesIds: string[]) {
    const userCompany = await this._userCompanyRepository.count({ user: id, company: { $in: companiesIds }, isActive: true });
    return companiesIds.length === userCompany;
  }
}
