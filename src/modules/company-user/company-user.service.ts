import { ConflictException, Injectable, Logger, LoggerService, NotFoundException } from '@nestjs/common';

import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CommonService }       from '@common/common.service';
import { AddUserToCompanyDto } from '@modules/company/dtos/add-user-to-company.dto';
import { CompanyUserEntity }   from '@modules/company-user/entities/company-user.entity';
import { RoleEnum }            from '@modules/company-user/enums/role.enum';

@Injectable()
export class CompanyUserService {
  private readonly loggerService: LoggerService;

  constructor(
    @InjectRepository(CompanyUserEntity) private readonly _userCompanyRepository: EntityRepository<CompanyUserEntity>,
    private readonly _commonService: CommonService,
  ) {
    this.loggerService = new Logger(CompanyUserService.name);
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
}
