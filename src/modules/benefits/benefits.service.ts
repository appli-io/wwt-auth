import { ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository }                                                     from '@mikro-orm/nestjs';
import { EntityManager, EntityRepository }                                      from '@mikro-orm/postgresql';

import { CommonService }              from '@common/common.service';
import { BenefitEntity }              from '@modules/benefits/entities/benefit.entity';
import { BenefitCompanyEntity }       from '@modules/benefits/entities/benefit-company.entity';
import { BenefitCategoryEntity }      from '@modules/benefits/entities/benefit-category.entity';
import { CreateBenefitCategoryDto }   from '@modules/benefits/dtos/create-benefit-category.dto';
import { CompanyEntity }              from '@modules/company/entities/company.entity';
import { UserEntity }                 from '@modules/users/entities/user.entity';
import { CompanyUserService }         from '@modules/company-user/company-user.service';
import { RoleEnum }                   from '@modules/company-user/enums/role.enum';
import { BenefitViewService }         from '@modules/benefits/services/benefit-view.service';
import { CreateBenefitDto }           from '@modules/benefits/dtos/create-benefit.dto';
import { BenefitCategoryViewService } from '@modules/benefits/services/benefit-category-view.service';

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
  public async createCategory(dto: CreateBenefitCategoryDto, companyId: CompanyEntity['id'], userId: UserEntity['id']): Promise<BenefitCategoryEntity> {
    await this._checkIfCategoryExistByName(dto.name, companyId);
    const member = await this._companyUserService.findOne(userId, companyId);

    if (!member || !member.isActive || member.role !== RoleEnum.ADMIN) throw new ForbiddenException('USER_NOT_ACTIVE');

    const parent = dto.parentId ? await this.findOneCategory(dto.parentId, companyId) : null;

    if (dto.parentId && !parent) throw new NotFoundException('PARENT_CATEGORY_NOT_FOUND');

    const category = this._categoryRepository.create({
      ...dto,
      company: companyId,
      parent: parent
    });

    await this._commonService.saveEntity(category, true);

    return category;
  }

  public async findOneCategory(id: string, companyId: CompanyEntity['id']): Promise<BenefitCategoryEntity> {
    const category = await this._categoryRepository.findOne({id, company: {id: companyId}});

    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

    this._benefitCategoryViewService.create(id);

    return category;
  }

  public async findAllCategories(companyId: CompanyEntity['id']): Promise<BenefitCategoryEntity[]> {
    const qb = this._categoryRepository.createQueryBuilder('c');
    const benefits = await qb.select([ 'c.*', 'COUNT(cv.id) as views' ])
      .leftJoin('c.benefits', 'cv')
      .where({company: {id: companyId}})
      .groupBy('c.id')
      .orderBy({views: 'DESC'})
      .getResultList();

    console.log(benefits);

    return benefits;
  }

  // Benefit Methods
  public async createBenefit(dto: CreateBenefitDto, companyId: CompanyEntity['id'], userId: UserEntity['id']): Promise<BenefitEntity> {
    const category = await this.findOneCategory(dto.categoryId, companyId);

    if (!category) throw new NotFoundException('CATEGORY_NOT_FOUND');

    const member = await this._companyUserService.findOne(userId, companyId);

    if (!member || !member.isActive) throw new ForbiddenException('USER_NOT_ACTIVE');

    const benefit = this._benefitRepository.create({
      ...dto,
      category,
      company: companyId,
      createdBy: member
    });

    await this._commonService.saveEntity(benefit, true);

    return benefit;
  }

  public async findOneBenefit(id: string, companyId: CompanyEntity['id']): Promise<BenefitEntity> {
    const benefit = await this._benefitRepository.findOne({id, company: {id: companyId}});

    if (!benefit) throw new NotFoundException('BENEFIT_NOT_FOUND');

    // Create view registry
    this._benefitViewService.create(id);

    return benefit;
  }

  public async findAllBenefits(companyId: CompanyEntity['id']): Promise<BenefitEntity[]> {
    const qb = this._benefitRepository.createQueryBuilder('b');

    // count views
    const benefits = await qb.select([ 'b.*', 'COUNT(bv.id) as views' ])
      .leftJoin('b.views', 'bv')
      .where({company: {id: companyId}})
      .andWhere('bv.timestamp > NOW() - INTERVAL \'1 month\'') // TODO: make it dynamic
      .groupBy('b.id')
      .orderBy({views: 'DESC'})
      .getResultList();

    console.log(benefits);

    return benefits;
  }

  public async removeBenefit(id: string, companyId: CompanyEntity['id']): Promise<void> {
    const benefit = await this._benefitRepository.findOne({id, company: {id: companyId}});

    if (!benefit) throw new NotFoundException('BENEFIT_NOT_FOUND');

    await this._commonService.removeEntity(benefit);
  }

  private async _checkIfCategoryExistByName(name: string, companyId: string) {
    const category = await this._categoryRepository.findOne({name, company: {id: companyId}});

    if (category) throw new ConflictException('NAME_ALREADY_EXIST');
  }
}
