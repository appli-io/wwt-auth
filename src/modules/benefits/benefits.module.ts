import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { BenefitEntity }         from '@modules/benefits/entities/benefit.entity';
import { BenefitCategoryEntity } from '@modules/benefits/entities/benefit-category.entity';
import { BenefitCompanyEntity }  from '@modules/benefits/entities/benefit-company.entity';
import { BenefitsController }    from './benefits.controller';
import { BenefitsService }       from './benefits.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([ BenefitEntity, BenefitCompanyEntity, BenefitCategoryEntity ]),
  ],
  controllers: [ BenefitsController ],
  providers: [ BenefitsService ]
})
export class BenefitsModule {}
