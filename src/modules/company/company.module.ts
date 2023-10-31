import { Module }            from '@nestjs/common';
import { CompanyController } from '@modules/company/company.controller';
import { CompanyService }    from '@modules/company/company.service';

@Module({
  imports: [],
  providers: [ CompanyService ],
  exports: [],
  controllers: [ CompanyController ],
})
export class CompanyModule {

}
