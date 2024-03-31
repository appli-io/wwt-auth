import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository }              from '@mikro-orm/nestjs';
import { EntityRepository }              from '@mikro-orm/postgresql';

import { CommonService }               from '@common/common.service';
import { Page, Pageable, PageFactory } from '@lib/pageable';
import { CompanyEntity }               from '@modules/company/entities/company.entity';
import { CreateCompanyDto }            from '@modules/company/dtos/create-company.dto';
import { CompanyUserService }          from '@modules/company-user/company-user.service';
import { RoleEnum }                    from '@modules/company-user/enums/role.enum';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity) private readonly _companyRepository: EntityRepository<CompanyEntity>,
    private readonly _companyUserService: CompanyUserService,
    private readonly _commonService: CommonService
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
    await this._companyUserService.assignCompanyToUser(company.id, {userId, role: RoleEnum.ADMIN});

    return this.findById(company.id);
  }

  public async findAll(pageable: Pageable): Promise<Page<CompanyEntity>> {
    // console.log(await this._companyRepository.findAll({populate: [ 'owner', 'users' ]}));
    return await new PageFactory<CompanyEntity>(
      pageable,
      this._companyRepository,
      {
        relations: [
          {
            property: 'owner',
            andSelect: true
          },
          {
            property: 'users',
            andSelect: true
          }
        ]
      }
    ).create();
  }

  public async findAll2(): Promise<CompanyEntity[]> {
    return this._companyRepository.findAll({populate: [ 'owner', 'users' ]});
  }

  public async findById(id: string): Promise<CompanyEntity> {
    return this._companyRepository.findOne({id}, {populate: [ 'owner', 'users' ]});
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
