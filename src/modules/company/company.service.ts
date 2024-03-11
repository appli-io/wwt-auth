import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository }              from '@mikro-orm/nestjs';
import { CompanyEntity }                 from '@modules/company/entities/company.entity';
import { EntityRepository }              from '@mikro-orm/postgresql';
import { CreateCompanyDto }              from '@modules/company/dtos/create-company.dto';
import { CommonService }                 from '@common/common.service';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity) private readonly companyRepository: EntityRepository<CompanyEntity>,
    private readonly commonService: CommonService
  ) {}

  public async create(createCompanyDto: CreateCompanyDto) {
    await this.checkIfCompanyExists(createCompanyDto.nationalId, createCompanyDto.country);
    await this.checkUsernameUniqueness(createCompanyDto.username);
    await this.checkEmailUniqueness(createCompanyDto.email);

    const company = this.companyRepository.create(createCompanyDto);

    await this.commonService.saveEntity(company);
    return company;
  }

  public async findAll() {
    return this.companyRepository.findAll();
  }

  private async checkIfCompanyExists(nationalId: string, country: string) {
    const company = await this.companyRepository.count({nationalId, country});

    if (company > 0)
      throw new ConflictException('Company already exists');
  }

  private async checkUsernameUniqueness(username: string) {
    const company = await this.companyRepository.count({username});

    if (company > 0)
      throw new ConflictException('Username already exists');
  }

  private async checkEmailUniqueness(email: string) {
    const company = await this.companyRepository.count({email});

    if (company > 0)
      throw new ConflictException('Email already exists');
  }
}
