import { ConflictException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';

import { QBFilterQuery }    from '@mikro-orm/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';

import { CommonService }               from '@common/common.service';
import { Page, Pageable, PageFactory } from '@lib/pageable';
import { CompanyEntity }               from '@modules/company/entities/company.entity';
import { CreateCompanyDto }            from '@modules/company/dtos/create-company.dto';
import { CompanyQueryDto }             from '@modules/company/dtos/company-query.dto';
import { CompanyUserService }          from '@modules/company-user/company-user.service';
import { RoleEnum }                    from '@modules/company-user/enums/role.enum';
import { StorageService }              from '@modules/firebase/services/storage.service';
import { UsersService }                from '@modules/users/users.service';
import * as path                       from 'node:path';
import { FileType }                    from '@modules/firebase/enums/file-type.enum';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(CompanyEntity) private readonly _companyRepository: EntityRepository<CompanyEntity>,
    @Inject(forwardRef(() => UsersService)) private readonly _userService: UsersService,
    private readonly _storageService: StorageService,
    private readonly _companyUserService: CompanyUserService,
    private readonly _commonService: CommonService,
  ) {}

  public async create(createCompanyDto: CreateCompanyDto, logo: Express.Multer.File, userId: string) {
    await this.checkIfCompanyExists(createCompanyDto.nationalId, createCompanyDto.country);
    await this.checkUsernameUniqueness(createCompanyDto.username);
    await this.checkEmailUniqueness(createCompanyDto.email);

    const company: CompanyEntity = this._companyRepository.create({
      ...createCompanyDto,
      owner: userId,
    });

    if (logo) {
      const basePath = `companies/${ company.id }`;
      logo.originalname = 'logo' + path.extname(logo.originalname);
      company.logo = await this._storageService.uploadImage(company.id, FileType.IMAGE, basePath, logo, true);
    }

    await this._commonService.saveEntity(company, true);
    await this._companyUserService.assignCompanyToUser(company.id, {userId, role: RoleEnum.ADMIN});
    await this._userService.setActiveCompany(userId, company.id);

    return this.findById(company.id);
  }

  public async findAll(query: CompanyQueryDto, pageable: Pageable): Promise<Page<CompanyEntity>> {
    const whereClause: QBFilterQuery<CompanyEntity> = {};

    if (query.id) whereClause['id'] = {$ilike: `%${ query.id }%`};
    if (query.name) whereClause['name'] = {$ilike: `%${ query.name }%`};
    if (query.username) whereClause['username'] = {$ilike: `%${ query.username }%`};
    if (query.email) whereClause['email'] = {$ilike: `%${ query.email }%`};
    if (query.nationalId) whereClause['nationalId'] = {$ilike: `%${ query.nationalId }%`};
    if (query.country) whereClause['country'] = {$ilike: `%${ query.country }%`};
    if (query.isActive) whereClause['isActive'] = query.isActive;
    if (query.isVerified) whereClause['isVerified'] = query.isVerified;

    const results = await new PageFactory<CompanyEntity>(
      pageable,
      this._companyRepository,
      {
        where: whereClause,
        relations: [
          {
            property: 'owner',
            andSelect: true
          },
          {
            property: 'users',
            andSelect: true
          },
          {
            property: 'logo',
            andSelect: true
          }
        ]
      }
    ).create();

    if (results.content.length > 0 && results.content.some(company => !company.logo?.fileUrl)) {
      await Promise.all(results.content.map(async company => {
        if (company.logo && !company.logo.fileUrl) company.logo.fileUrl = await this._storageService.getDownloadUrl(company.logo.filepath);

        this._commonService.saveEntity(company, true).then();
      }));
    }

    return results;
  }

  public async findById(id: string): Promise<CompanyEntity> {
    const result = await this._companyRepository.findOne({id}, {populate: [ 'owner', 'users', 'logo' ]});

    if (!result) throw new NotFoundException('NOT_FOUND');

    return result;
  }

  private async checkIfCompanyExists(nationalId: string, country: string) {
    const company = await this._companyRepository.count({nationalId, country});

    if (company > 0)
      throw new ConflictException('CONFLICT');
  }

  private async checkUsernameUniqueness(username: string) {
    const company = await this._companyRepository.count({username});

    if (company > 0)
      throw new ConflictException('CONFLICT_USERNAME');
  }

  private async checkEmailUniqueness(email: string) {
    const company = await this._companyRepository.count({email});

    if (company > 0)
      throw new ConflictException('CONFLICT_EMAIL');
  }
}
