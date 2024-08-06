import { Injectable }            from '@nestjs/common';
import { InjectRepository }      from '@mikro-orm/nestjs';
import { BenefitEntity }         from '@modules/benefits/entities/benefit.entity';
import { EntityRepository }      from '@mikro-orm/core';
import { BenefitCompanyEntity }  from '@modules/benefits/entities/benefit-company.entity';
import { BenefitCategoryEntity } from './entities/benefit-category.entity';

@Injectable()
export class BenefitsService {
  constructor(
    @InjectRepository(BenefitEntity) private readonly benefitRepository: EntityRepository<BenefitEntity>,
    @InjectRepository(BenefitCompanyEntity) private readonly companyRepository: EntityRepository<BenefitCompanyEntity>,
    @InjectRepository(BenefitCategoryEntity) private readonly categoryRepository: EntityRepository<BenefitCategoryEntity>,
  ) {}
}
