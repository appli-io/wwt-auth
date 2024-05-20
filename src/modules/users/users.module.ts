import { MikroOrmModule }     from '@mikro-orm/nestjs';
import { forwardRef, Module } from '@nestjs/common';

import { CompanyUserModule }  from '@modules/company-user/company-user.module';
import { UsersContactEntity } from '@modules/company-user/entities/users-contact.entity';

import { OAuthProviderEntity } from './entities/oauth-provider.entity';
import { UserEntity }          from './entities/user.entity';
import { UsersController }     from './users.controller';
import { UsersService }        from './users.service';
import { CompanyModule }       from '@modules/company/company.module';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      OAuthProviderEntity,
      UserEntity,
      UsersContactEntity
    ]),
    CompanyUserModule,
    forwardRef(() => CompanyModule)
  ],
  providers: [ UsersService ],
  exports: [ UsersService ],
  controllers: [ UsersController ],
})
export class UsersModule {
}
