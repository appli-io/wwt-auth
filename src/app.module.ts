import { MikroOrmModule }                         from '@mikro-orm/nestjs';
import { CacheModule }                            from '@nestjs/cache-manager';
import { Module }                                 from '@nestjs/common';
import { ConfigModule, ConfigService }            from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule }                        from '@nestjs/throttler';

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

import { AppService }              from './app.service';
import { config }                  from './config';
import { HttpResponseInterceptor } from '@common/interceptors/http-response.interceptor';
import { PermissionsModule }       from './modules/permissions/permissions.module';
import { HttpExceptionFilter }     from '@common/filters/http-exception.filter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
      load: [ config ],
    }),
    MikroOrmModule.forRootAsync({
      providers: [ ConfigService ],
      imports: [ ConfigModule ],
      useClass: MikroOrmConfig
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
    PermissionsModule,
  ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpResponseInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
