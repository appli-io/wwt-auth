import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }                                 from '@mikro-orm/nestjs';
import { EntityRepository }                                 from '@mikro-orm/postgresql';

import { CommonService }              from '@common/common.service';
import { BenefitEntity }              from '@modules/benefits/entities/benefit.entity';
import { BenefitCompanyEntity }       from '@modules/benefits/entities/benefit-company.entity';
import { BenefitCategoryEntity }      from '@modules/benefits/entities/benefit-category.entity';
import { CreateBenefitCategoryDto }   from '@modules/benefits/dtos/create-benefit-category.dto';
import { CompanyEntity }              from '@modules/company/entities/company.entity';
import { BenefitViewService }         from '@modules/benefits/services/benefit-view.service';
import { CreateBenefitDto }           from '@modules/benefits/dtos/create-benefit.dto';
import { BenefitCategoryViewService } from '@modules/benefits/services/benefit-category-view.service';
import { CompanyUserEntity }          from '@modules/company-user/entities/company-user.entity';
import { CreateBenefitCompanyDto }    from '@modules/benefits/dtos/create-benefit-company.dto';
import { BenefitCategoryRepository }  from '@modules/benefits/entities/repositories/benefit-category.repository';
import { StorageService }             from '@modules/firebase/services/storage.service';
import { FileType }                   from '@modules/firebase/enums/file-type.enum';
import { BenefitCompanyRepository }   from '@modules/benefits/entities/repositories/benefit-company.repository';
import { QueryOrder }                 from '@mikro-orm/core';

@Injectable()
export class BenefitsService {
  constructor(
    @InjectRepository(BenefitEntity) private readonly _benefitRepository: EntityRepository<BenefitEntity>,
    private readonly _companyRepository: BenefitCompanyRepository,
    private readonly _categoryRepository: BenefitCategoryRepository,
    private readonly _benefitViewService: BenefitViewService,
    private readonly _benefitCategoryViewService: BenefitCategoryViewService,
    private readonly _commonService: CommonService,
    private readonly _storageService: StorageService
  ) {}

  // Category Methods
  public async createCategory(dto: CreateBenefitCategoryDto, member: CompanyUserEntity): Promise<BenefitCategoryEntity> {
    await this._checkIfCategoryExistByName(dto.name, member.company.id);

    const parent = dto.parent ? await this.findOneCategory(dto.parent, member.company.id, false) : null;

    if (dto.parent && !parent) throw new NotFoundException('PARENT_CATEGORY_NOT_FOUND');

    const categoryCount = await this._categoryRepository.countByNameAndParent(dto.name, dto.parent, member.company.id);

    if (categoryCount > 0) throw new ConflictException('CATEGORY_ALREADY_EXIST');

    if (dto.icon) {
      const result = await this._storageService.uploadFile(dto.icon, {type: FileType.IMAGE}, member.company.id);
      dto.icon = result['image'];
    }

    if (dto.image) {
      const result = await this._storageService.uploadFile(dto.image, {type: FileType.IMAGE, mustOptimize: true}, member.company.id);
      dto.image = result['image'];
    }

    const category = this._categoryRepository.create({
      ...dto,
      company: member.company.id,
      parent: parent,
      createdBy: member
    });

    await this._commonService.saveEntity(category, true);

    return category;
  }

  public async findOneCategory(id: string, companyId: CompanyEntity['id'], count: boolean = true): Promise<BenefitCategoryEntity> {
    const category = await this._categoryRepository.findOne({
      id,
      company: {id: companyId}
    }, {populate: [ 'parent', 'icon', 'image', 'subCategories' ]});

    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

    // Create view registry
    if (count) this._benefitCategoryViewService.create(id);

    return category;
  }

  /**
   * Find all benefits of a category, if contain subcategories, return all benefits of subcategories
   *
   * @param id
   * @param companyId
   */
  public async findCategoryBenefits(id: string, companyId: CompanyEntity['id']): Promise<BenefitEntity[]> {
    const category = await this._categoryRepository.findOne({
      id,
      company: {id: companyId}
    }, {populate: [ 'benefits', 'subCategories.benefits' ], refresh: true});

    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

    const benefits = category.benefits.getItems();

    if (category.subCategories.isInitialized()) {
      category.subCategories.getItems().forEach((subCategory) => {
        benefits.push(...subCategory.benefits.getItems());
      });
    }

    return benefits;
  }

  public async findAllCategories(companyId: CompanyEntity['id']): Promise<BenefitCategoryEntity[]> {
    return this._categoryRepository.find({company: {id: companyId}}, {populate: [ 'subCategories', 'parent', 'icon', 'image' ]});
  }

  public async findMostViewedCategories(companyId: CompanyEntity['id'], limit = 3) {
    return await this._categoryRepository.createQueryBuilder('c')
      .select('*')
      .leftJoinAndSelect('c.icon', 'icon')
      .leftJoinAndSelect('c.image', 'image')
      .leftJoin('c.views', 'views')
      .where({company: companyId})
      .groupBy([ 'id', 'icon.id', 'image.id' ])
      .orderBy({'views.count': QueryOrder.DESC})
      .limit(limit)
      .getResult();
  }

  public async deleteCategory(id: string, companyId: CompanyEntity['id']): Promise<void> {
    const category = await this._categoryRepository.findOne({id, company: {id: companyId}});

    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

    await this._commonService.removeEntity(category);
  }

  // Benefit Methods
  public async createBenefit(dto: CreateBenefitDto, member: CompanyUserEntity): Promise<BenefitEntity> {
    const category = await this.findOneCategory(dto.categoryId, member.company.id, false);

    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

    if (dto.image) {
      const result = await this._storageService.uploadFile(dto.image, {type: FileType.IMAGE, mustOptimize: true}, member.company.id);
      dto.image = result['image'];
    }

    const benefit = this._benefitRepository.create({
      ...dto,
      category,
      company: member.company.id,
      benefitCompany: dto.companyId,
      createdBy: member
    });

    await this._commonService.saveEntity(benefit, true);

    return benefit;
  }

  public async findOneBenefit(id: string, companyId: CompanyEntity['id']): Promise<BenefitEntity> {
    const benefit = await this._benefitRepository.findOne({id, company: {id: companyId}}, {populate: [ 'category', 'benefitCompany' ]});

    if (!benefit) throw new NotFoundException('BENEFIT_NOT_FOUND');

    // Create view registry
    this._benefitViewService.create(id);

    return benefit;
  }

  public async findAllBenefits(companyId: CompanyEntity['id'], ...options: any): Promise<BenefitEntity[]> {
    const filter = {company: {id: companyId}};

    options.forEach((option: { [key: string]: any }) => {
      if (typeof option === 'object') {
        Object.keys(option).forEach((key) => {
          filter[key] = option[key];
        });
      }
    });
    return await this._benefitRepository.find(filter, {populate: [ 'category', 'benefitCompany' ]});
  }

  public async findMostViewedBenefits(companyId: CompanyEntity['id'], limit: number = 3) {
    return await this._benefitRepository.createQueryBuilder('b')
      .select('*')
      .leftJoinAndSelect('b.image', 'image')
      .leftJoinAndSelect('b.category', 'category')
      .leftJoinAndSelect('b.benefitCompany', 'benefitCompany')
      .leftJoin('b.views', 'views')
      .where({'company': companyId})
      .groupBy([ 'id', 'image.id', 'benefitCompany.id', 'category.id' ])
      .orderBy({'views.count': QueryOrder.DESC})
      .limit(limit)
      .getResult();
  }

  public async deleteBenefit(id: string, companyId: CompanyEntity['id']): Promise<void> {
    const benefit = await this._benefitRepository.findOne({id, company: {id: companyId}});

    if (!benefit) throw new NotFoundException('BENEFIT_NOT_FOUND');

    await this._commonService.removeEntity(benefit);
  }

  // Company Methods
  public async createCompany(dto: CreateBenefitCompanyDto, member: CompanyUserEntity): Promise<BenefitCompanyEntity> {
    const tempCompany = await this._companyRepository.countByName(dto.name, member.company.id);

    if (tempCompany > 0) throw new ConflictException('COMPANY_ALREADY_EXIST');

    if (dto.image) {
      const result = await this._storageService.uploadFile(dto.image, {type: FileType.IMAGE, mustOptimize: true}, member.company.id);
      dto.image = result['image'];
    }

    const company = this._companyRepository.create({
      ...dto,
      company: member.company.id,
      createdBy: member
    });

    await this._commonService.saveEntity(company, true);

    return company;
  }

  public async findAllCompanies(companyId: CompanyEntity['id']): Promise<BenefitCompanyEntity[]> {
    return this._companyRepository.find({company: {id: companyId}});
  }

  public async deleteCompany(id: string, companyId: CompanyEntity['id']): Promise<void> {
    const company = await this._companyRepository.findOne({id, company: {id: companyId}});

    if (!company) throw new NotFoundException('COMPANY_NOT_FOUND');

    await this._commonService.removeEntity(company);
  }

  private async _checkIfCategoryExistByName(name: string, companyId: string) {
    const category = await this._categoryRepository.findOne({name, company: {id: companyId}});

    if (category) throw new ConflictException('NAME_ALREADY_EXIST');
  }
}
