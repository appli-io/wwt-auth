import { Global, Module } from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { CompanyUserEntity } from '@modules/company-user/entities/company-user.entity';
import { CompanyUserService } from '@modules/company-user/company-user.service';
import { CompanyUserController } from '@modules/company-user/company-user.controller';
import { CompanyUserInviteEntity } from './entities/company-user-invite.entity';
import { CompanyUserInviteService } from './company-user-invite.service';

@Global()
@Module({
  imports: [
    MikroOrmModule.forFeature([
      CompanyUserEntity,
      CompanyUserInviteEntity
    ])
  ],
  providers: [CompanyUserService, CompanyUserInviteService],
  controllers: [CompanyUserController],
  exports: [CompanyUserService, MikroOrmModule],
})
export class CompanyUserModule { }
