import { Module }         from '@nestjs/common';
import { MikroOrmModule } from '@mikro-orm/nestjs';

import { BlacklistedTokenEntity } from '@/modules/auth/entities/blacklisted-token.entity';
import { JwtModule }              from '@/modules/jwt/jwt.module';
import { MailerModule }           from '@/modules/mailer/mailer.module';
import { UsersModule }            from '@/modules/users/users.module';

import { AuthService } from './auth.service';

@Module({
  imports: [
    MikroOrmModule.forFeature([ BlacklistedTokenEntity ]),
    UsersModule,
    JwtModule,
    MailerModule,
  ],
  providers: [ AuthService ]
})
export class AuthModule {}
