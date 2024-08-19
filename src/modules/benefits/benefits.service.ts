import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }                                 from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository }                  from '@mikro-orm/postgresql';

import { CommonService }              from '@common/common.service';
import { BenefitEntity }              from '@modules/benefits/entities/benefit.entity';
import { BenefitCompanyEntity }       from '@modules/benefits/entities/benefit-company.entity';
import { BenefitCategoryEntity }      from '@modules/benefits/entities/benefit-category.entity';
import { CreateBenefitCategoryDto }   from '@modules/benefits/dtos/create-benefit-category.dto';
import { CompanyEntity }              from '@modules/company/entities/company.entity';
import { CompanyUserService }         from '@modules/company-user/company-user.service';
import { BenefitViewService }         from '@modules/benefits/services/benefit-view.service';
import { CreateBenefitDto }           from '@modules/benefits/dtos/create-benefit.dto';
import { BenefitCategoryViewService } from '@modules/benefits/services/benefit-category-view.service';
import { CompanyUserEntity }          from '@modules/company-user/entities/company-user.entity';
import { CreateBenefitCompanyDto }    from '@modules/benefits/dtos/create-benefit-company.dto';

@Injectable()
export class BenefitsService {
  constructor(
    @InjectRepository(BenefitEntity) private readonly _benefitRepository: EntityRepository<BenefitEntity>,
    @InjectRepository(BenefitCompanyEntity) private readonly _companyRepository: EntityRepository<BenefitCompanyEntity>,
    @InjectRepository(BenefitCategoryEntity) private readonly _categoryRepository: EntityRepository<BenefitCategoryEntity>,
    private readonly _commonService: CommonService,
    private readonly _companyUserService: CompanyUserService,
    private readonly _benefitViewService: BenefitViewService,
    private readonly _benefitCategoryViewService: BenefitCategoryViewService,
    private readonly _em: EntityManager,
  ) {}

  // Category Methods
  public async createCategory(dto: CreateBenefitCategoryDto, member: CompanyUserEntity): Promise<BenefitCategoryEntity> {
    await this._checkIfCategoryExistByName(dto.name, member.company.id);

    const parent = dto.parentId ? await this.findOneCategory(dto.parentId, member.company.id, false) : null;

    if (dto.parentId && !parent) throw new NotFoundException('PARENT_CATEGORY_NOT_FOUND');

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
    const category = await this._categoryRepository.findOne({id, company: {id: companyId}});

    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

    // Create view registry
    if (count) this._benefitCategoryViewService.create(id);

    return category;
  }

  public async findAllCategories(companyId: CompanyEntity['id']): Promise<BenefitCategoryEntity[]> {
    return this._categoryRepository.find({company: {id: companyId}});
  }

  // Benefit Methods
  public async createBenefit(dto: CreateBenefitDto, member: CompanyUserEntity): Promise<BenefitEntity> {
    const category = await this.findOneCategory(dto.categoryId, member.company.id, false);

    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

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

  public async findAllBenefits(companyId: CompanyEntity['id']): Promise<BenefitEntity[]> {
    return await this._benefitRepository.find({company: {id: companyId}}, {populate: [ 'category', 'benefitCompany' ]});
  }

  public async findMostViewedBenefits(companyId: CompanyEntity['id']): Promise<BenefitEntity[]> {
    const qb = this._benefitRepository.createQueryBuilder('b');

    // count views
    const benefits = await qb.select([ 'b.*', 'COUNT(bv.id) as views_count' ])
      .leftJoin('b.views', 'bv')
      .where({company: {id: companyId}})
      .andWhere('bv.timestamp > NOW() - INTERVAL \'1 month\'') // TODO: make it dynamic
      .groupBy('b.id')
      .orderBy({views_count: 'DESC'})
      .limit(5)
      .getResultList();

    console.log(benefits);

    return benefits;
  }

  public async removeBenefit(id: string, companyId: CompanyEntity['id']): Promise<void> {
    const benefit = await this._benefitRepository.findOne({id, company: {id: companyId}});

    if (!benefit) throw new NotFoundException('BENEFIT_NOT_FOUND');

    await this._commonService.removeEntity(benefit);
  }

  // Company Methods
  public async createCompany(dto: CreateBenefitCompanyDto, member: CompanyUserEntity): Promise<BenefitCompanyEntity> {
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

  private async _checkIfCategoryExistByName(name: string, companyId: string) {
    const category = await this._categoryRepository.findOne({name, company: {id: companyId}});

    if (category) throw new ConflictException('NAME_ALREADY_EXIST');
  }
}
