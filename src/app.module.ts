import { MikroOrmModule }   from '@mikro-orm/nestjs';
import { CacheModule }      from '@nestjs/cache-manager';
import { Module }           from '@nestjs/common';
import { ConfigModule }     from '@nestjs/config';
import { APP_GUARD }        from '@nestjs/core';
import { ThrottlerModule }  from '@nestjs/throttler';

import { CommonModule }     from '@common/common.module';
import { AuthModule }       from '@modules/auth/auth.module';
import { AuthGuard }        from '@modules/auth/guards/auth.guard';
import { JwtModule }        from '@modules/jwt/jwt.module';
import { MailerModule }     from '@modules/mailer/mailer.module';
import { UsersModule }      from '@modules/users/users.module';
import { Oauth2Module }     from '@modules/oauth2/oauth2.module';
import { CacheConfig }      from '@config/cache.config';
import { validationSchema } from '@config/config.schema';
import { MikroOrmConfig }   from '@config/mikroorm.config';
import { ThrottlerConfig }  from '@config/throttler.config';

import { AppService }       from './app.service';
import { config }           from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [ config ],
    }),
    MikroOrmModule.forRootAsync({
      imports: [ ConfigModule ],
      useClass: MikroOrmConfig,
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ ConfigModule ],
      useClass: CacheConfig,
    }),
    ThrottlerModule.forRootAsync({
      imports: [ ConfigModule ],
      useClass: ThrottlerConfig,
    }),
    CommonModule,
    UsersModule,
    AuthModule,
    JwtModule,
    MailerModule,
    Oauth2Module,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
