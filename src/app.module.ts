import { CacheModule }                            from '@nestjs/cache-manager';
import { Module, OnModuleInit }                   from '@nestjs/common';
import { ConfigModule, ConfigService }            from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { DevtoolsModule }                         from '@nestjs/devtools-integration';
import { ThrottlerModule }                        from '@nestjs/throttler';

import { MikroOrmModule }      from '@mikro-orm/nestjs';
import { FastifyMulterModule } from '@nest-lab/fastify-multer';

import { CommonModule }            from '@common/common.module';
import { HttpExceptionFilter }     from '@common/filters/http-exception.filter';
import { HttpResponseInterceptor } from '@common/interceptors/http-response.interceptor';
import { MikroOrmLogger }          from '@config/mikroorm.logger';
import { CacheConfig }             from '@config/cache.config';
import { validationSchema }        from '@config/config.schema';
import { MikroOrmConfig }          from '@config/mikroorm.config';
import { ThrottlerConfig }         from '@config/throttler.config';
import { AuthModule }              from '@modules/auth/auth.module';
import { AlbumModule }             from '@modules/images/album.module';
import { AuthGuard }               from '@modules/auth/guards/auth.guard';
import { BenefitsModule }          from '@modules/benefits/benefits.module';
import { LocationModule }          from '@modules/location/location.module';
import { BioBioModule }            from '@modules/biobio/biobio.module';
import { CompanyModule }           from '@modules/company/company.module';
import { CompanyUserModule }       from '@modules/company-user/company-user.module';
import { EventsModule }            from '@modules/events/events.module';
import { FirebaseModule }          from '@modules/firebase/firebase.module';
import { JwtModule }               from '@modules/jwt/jwt.module';
import { LikeModule }              from '@modules/likes/like.module';
import { MailerModule }            from '@modules/mailer/mailer.module';
import { MarketplaceModule }       from '@modules/marketplace/marketplace.module';
import { NewsModule }              from '@modules/news/news.module';
import { Oauth2Module }            from '@modules/oauth2/oauth2.module';
import { PermissionsModule }       from '@modules/permissions/permissions.module';
import { SeederService }           from '@modules/seeder/seeder.service';
import { ScrumboardModule }        from '@modules/scrumboard/scrumboard.module';
import { UsersModule }             from '@modules/users/users.module';

import { AppController } from './app.controller';
import { AppService }    from './app.service';
import { config }        from './config';
import { SentryModule }  from '@sentry/nestjs/setup';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
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
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    SentryModule.forRoot(),
    FastifyMulterModule,
    FirebaseModule,
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
    LikeModule,
    BioBioModule,
    AlbumModule,
    EventsModule,
    ScrumboardModule,
    MarketplaceModule,
    BenefitsModule,
    LocationModule
  ],
  controllers: [ AppController ],
  providers: [
    AppService,
    MikroOrmLogger,
    SeederService,
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
export class AppModule implements OnModuleInit {
  constructor(private readonly ormLogger: MikroOrmLogger) {}

  onModuleInit() {
    this.ormLogger.onModuleInit();
  }
}
