import { MikroOrmModule }           from '@mikro-orm/nestjs';
import { Module }                   from '@nestjs/common';
import { OAuthProviderEntity }      from './entities/oauth-provider.entity';
import { UserEntity }               from './entities/user.entity';
import { UsersController }          from './users.controller';
import { UsersService }             from './users.service';
import { RolEntity }                from '@modules/users/entities/rol.entity';
import { PermissionActionEntity }   from '@modules/users/entities/permission/action.entity';
import { PermissionResourceEntity } from '@modules/users/entities/permission/resource.entity';
import { RolResourceActionEntity }  from '@modules/users/entities/rol-resource-action.entity';
import { JwtModule }                from '@modules/jwt/jwt.module';

@Module({
  imports: [ MikroOrmModule.forFeature([
    OAuthProviderEntity,
    PermissionActionEntity,
    PermissionResourceEntity,
    RolEntity,
    RolResourceActionEntity,
    UserEntity,
  ]),
    JwtModule
  ],
  providers: [ UsersService ],
  exports: [ UsersService ],
  controllers: [ UsersController ],
})
export class UsersModule {
}
