import { MikroOrmModule }                         from '@mikro-orm/nestjs';
import { CacheModule }                            from '@nestjs/cache-manager';
import { Module }                                 from '@nestjs/common';
import { ConfigModule, ConfigService }            from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerModule }                        from '@nestjs/throttler';

import { CommonModule }            from '@common/common.module';
import { HttpExceptionFilter }     from '@common/filters/http-exception.filter';
import { HttpResponseInterceptor } from '@common/interceptors/http-response.interceptor';
import { CacheConfig }             from '@config/cache.config';
import { validationSchema }        from '@config/config.schema';
import { MikroOrmConfig }          from '@config/mikroorm.config';
import { ThrottlerConfig }         from '@config/throttler.config';
import { AuthModule }              from '@modules/auth/auth.module';
import { AuthGuard }               from '@modules/auth/guards/auth.guard';
import { CompanyModule }           from '@modules/company/company.module';
import { CompanyUserModule }       from '@modules/company-user/company-user.module';
import { JwtModule }               from '@modules/jwt/jwt.module';
import { LikeModule }              from '@modules/likes/like.module';
import { MailerModule }            from '@modules/mailer/mailer.module';
import { NewsModule }              from '@modules/news/news.module';
import { PermissionsModule }       from '@modules/permissions/permissions.module';
import { UsersModule }             from '@modules/users/users.module';
import { Oauth2Module }            from '@modules/oauth2/oauth2.module';

import { AppService } from './app.service';
import { config }     from './config';

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
    CompanyModule,
    UsersModule,
    CompanyUserModule,
    AuthModule,
    JwtModule,
    MailerModule,
    Oauth2Module,
    PermissionsModule,
    NewsModule,
    LikeModule
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
