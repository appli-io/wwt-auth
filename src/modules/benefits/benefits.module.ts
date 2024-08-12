import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { BenefitEntity }              from '@modules/benefits/entities/benefit.entity';
import { BenefitCategoryEntity }      from '@modules/benefits/entities/benefit-category.entity';
import { BenefitCompanyEntity }       from '@modules/benefits/entities/benefit-company.entity';
import { BenefitViewEntity }          from '@modules/benefits/entities/benefit-view.entity';
import { BenefitCategoryViewEntity }  from '@modules/benefits/entities/benefit-category-view.entity';
import { BenefitViewService }         from '@modules/benefits/services/benefit-view.service';
import { BenefitCategoryViewService } from '@modules/benefits/services/benefit-category-view.service';
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
  controllers: [ BenefitsController ],
  providers: [
    BenefitsService,

    // Views registry
    BenefitViewService,
    BenefitCategoryViewService
  ]
})
export class BenefitsModule {}
