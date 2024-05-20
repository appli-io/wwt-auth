import { forwardRef, Module } from '@nestjs/common';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CompanyController } from '@modules/company/company.controller';
import { CompanyService }    from '@modules/company/company.service';
import { CompanyEntity }     from '@modules/company/entities/company.entity';
import { CompanyUserModule } from '@modules/company-user/company-user.module';
import { UsersModule }       from '@modules/users/users.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      CompanyEntity,
    ]),
    CompanyUserModule,
    forwardRef(() => UsersModule),
  ],
  providers: [ CompanyService ],
  exports: [ CompanyService ],
  controllers: [ CompanyController ],
})
export class CompanyModule {
}
