import { Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CompanyController } from '@modules/company/company.controller';
import { CompanyService }    from '@modules/company/company.service';
import { CompanyEntity }     from '@modules/company/entities/company.entity';

@Module({
  imports: [ MikroOrmModule.forFeature([
    CompanyEntity
  ]) ],
  providers: [ CompanyService ],
  exports: [ CompanyService ],
  controllers: [ CompanyController ],
})
export class CompanyModule {
}
