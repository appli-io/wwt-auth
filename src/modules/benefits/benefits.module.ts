import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { BenefitCategoryController }  from './controllers/category.controller';
import { BenefitEntity }              from './entities/benefit.entity';
import { BenefitCategoryEntity }      from './entities/benefit-category.entity';
import { BenefitCompanyEntity }       from './entities/benefit-company.entity';
import { BenefitViewEntity }          from './entities/benefit-view.entity';
import { BenefitCategoryViewEntity }  from './entities/benefit-category-view.entity';
import { BenefitViewService }         from './services/benefit-view.service';
import { BenefitCategoryViewService } from './services/benefit-category-view.service';
import { BenefitsController }         from './benefits.controller';
import { BenefitsService }            from './benefits.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      BenefitEntity,
      BenefitCompanyEntity,
      BenefitCategoryEntity,

      // Views registry
      BenefitViewEntity,
      BenefitCategoryViewEntity
    ]),
  ],
  controllers: [
    BenefitsController,
    BenefitCategoryController
  ],
  providers: [
    BenefitsService,

    // Views registry
    BenefitViewService,
    BenefitCategoryViewService
  ]
})
export class BenefitsModule {}
