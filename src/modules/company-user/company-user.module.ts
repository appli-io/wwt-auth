import { Global, Module }        from '@nestjs/common';
import { MikroOrmModule }        from '@mikro-orm/nestjs';
import { CompanyUserEntity }     from '@modules/company-user/entities/company-user.entity';
import { CompanyUserService }    from '@modules/company-user/company-user.service';
import { CompanyUserController } from '@modules/company-user/company-user.controller';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([
      CompanyUserEntity
    ])
  ],
  providers: [ CompanyUserService ],
  controllers: [ CompanyUserController ],
  exports: [ CompanyUserService ],
})
export class CompanyUserModule {}
