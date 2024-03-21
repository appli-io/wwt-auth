import { ConflictException, Injectable } from '@nestjs/common';
import { EntityManager }                 from '@mikro-orm/core';
import { InjectRepository }              from '@mikro-orm/nestjs';
import { EntityRepository }              from '@mikro-orm/postgresql';

import { CommonService }     from '@common/common.service';
import { CompanyEntity }     from '@modules/company/entities/company.entity';
import { CreateCompanyDto }  from '@modules/company/dtos/create-company.dto';
import { UserCompanyEntity } from '@modules/users/entities/user-company.entity';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity) private readonly _companyRepository: EntityRepository<CompanyEntity>,
    @InjectRepository(UserCompanyEntity) private readonly _userCompanyRepository: EntityRepository<UserCompanyEntity>,
    private readonly _commonService: CommonService,
    private _em: EntityManager
  ) {}

  public async create(createCompanyDto: CreateCompanyDto, userId: number) {
    await this.checkIfCompanyExists(createCompanyDto.nationalId, createCompanyDto.country);
    await this.checkUsernameUniqueness(createCompanyDto.username);
    await this.checkEmailUniqueness(createCompanyDto.email);

    const company: CompanyEntity = this._companyRepository.create({
      ...createCompanyDto,
      owner: userId,
    });

    await this._commonService.saveEntity(company, true);

    // assign the company to the user
    const userCompany = this._userCompanyRepository.create({
      user: userId,
      company: company,
    });

    await this._commonService.saveEntity(userCompany, true);

    return this.findById(company.id);
  }

  public async findAll(): Promise<CompanyEntity[]> {
    return this._companyRepository.findAll({populate: [ 'owner', 'users' ]});
  }

  public async findById(id: string): Promise<CompanyEntity> {
    return this._companyRepository.findOneOrFail({id}, {populate: [ 'owner', 'users' ]});
  }

  private async checkIfCompanyExists(nationalId: string, country: string) {
    const company = await this._companyRepository.count({nationalId, country});

    if (company > 0)
      throw new ConflictException('Company already exists');
  }

  private async checkUsernameUniqueness(username: string) {
    const company = await this._companyRepository.count({username});

    if (company > 0)
      throw new ConflictException('Username already exists');
  }

  private async checkEmailUniqueness(email: string) {
    const company = await this._companyRepository.count({email});

    if (company > 0)
      throw new ConflictException('Email already exists');
  }
}
