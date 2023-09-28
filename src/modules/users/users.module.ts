import { MikroOrmModule }      from '@mikro-orm/nestjs';
import { Module }              from '@nestjs/common';
import { OAuthProviderEntity } from './entities/oauth-provider.entity';
import { UserEntity }          from './entities/user.entity';
import { UsersController }     from './users.controller';
import { UsersService }        from './users.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([
      OAuthProviderEntity,
      UserEntity,
    ])
  ],
  providers: [ UsersService ],
  exports: [ UsersService ],
  controllers: [ UsersController ],
})
export class UsersModule {
}
