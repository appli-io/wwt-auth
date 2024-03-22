import { Module }             from '@nestjs/common';
import { MikroOrmModule }     from '@mikro-orm/nestjs';
import { CompanyUserEntity }  from '@modules/company-user/entities/company-user.entity';
import { CompanyUserService } from '@modules/company-user/company-user.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      CompanyUserEntity
    ])
  ],
  providers: [ CompanyUserService ],
  controllers: [],
  exports: [ CompanyUserService ],
})
export class CompanyUserModule {}
