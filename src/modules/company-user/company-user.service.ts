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

@Injectable()
export class CompanyUserService {
  private readonly loggerService: LoggerService;

  constructor(
    @InjectRepository(CompanyUserEntity) private readonly _userCompanyRepository: EntityRepository<CompanyUserEntity>,
    public readonly _em: EntityManager,
    private readonly _commonService: CommonService,
  ) {
    this.loggerService = new Logger(CompanyUserService.name);
  }

  public async getMembers(companyId: string, query: MembersQueryDto, pageable: Pageable) {
    const whereClause: QBFilterQuery<CompanyUserEntity> = {company: {id: {$eq: companyId}}};

    if (query.memberId) whereClause.user = {id: {$eq: query.memberId}};
    if (query.role) whereClause.role = {$eq: query.role};
    if (query.isActive) whereClause.isActive = {$eq: query.isActive};
    if (query.createdFrom) whereClause.createdAt = {$gte: query.createdFrom};

    const users: Page<CompanyUserEntity> = await new PageFactory(
      pageable,
      this._userCompanyRepository,
      {
        where: whereClause,
        relations: [
          {
            property: 'user',
            andSelect: true
          }
        ]
      }
    ).create();

    return users;
  }

  public async findOne(userId: number, companyId: string) {
    return this._userCompanyRepository.findOne({user: userId, company: companyId});
  }

  public async getUserAssignedCompanies(userId: number) {
    return this._userCompanyRepository.find({user: userId});
  }

  public async assignCompanyToUser(companyId: string, {userId, role}: AddUserToCompanyDto) {
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

  public async removeCompanyFromUser(companyId: string, userId: number): Promise<boolean> {
    this.loggerService.log('Removing company from user');

    const userCompany = await this._userCompanyRepository.findOneOrFail({user: userId, company: companyId})
      .catch(() => {
        throw new NotFoundException('Member not found in company');
      });

    await this._commonService.removeEntity(userCompany);

    return true;
  }

  public async disableUserInCompany(companyId: string, userId: number): Promise<boolean> {
    this.loggerService.log('Disabling user in company');

    const userCompany = await this._userCompanyRepository.findOneOrFail({user: userId, company: companyId})
      .catch(() => {
        throw new NotFoundException('Member not found in company');
      });

    userCompany.isActive = false;

    await this._commonService.saveEntity(userCompany);

    return true;
  }

  public async getUserRole(companyId: string, userId: number, requiredRoles: RoleEnum[]) {
    const qb = this._userCompanyRepository
      .getEntityManager()
      .createQueryBuilder(CompanyUserEntity);

    qb.where({user: userId, company: companyId});

    if (requiredRoles.length > 1) qb.andWhere({role: {$in: requiredRoles}});

    const results = await qb.select('role').execute();
    const roles: RoleEnum[] = results.map(result => result.role);

    return roles;
  }

  public isUserInCompany = (companyId: string, userId: number) =>
    this._userCompanyRepository.count({user: userId, company: companyId})
      .then(userCompany => userCompany > 0);

  public async isActiveUserInCompanies(id: number, companiesIds: string[]) {
    const userCompany = await this._userCompanyRepository.count({user: id, company: {$in: companiesIds}, isActive: true});
    return companiesIds.length === userCompany;
  }
}
