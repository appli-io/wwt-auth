import { CacheModule }  from '@nestjs/cache-manager';
import { Module }       from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { MikroOrmModule } from '@mikro-orm/nestjs';

import { CommonModule }     from '@common/common.module';
import { CacheConfig }      from '@config/cache.config';
import { config }           from '@config/config';
import { validationSchema } from '@config/config.schema';
import { MikroOrmConfig }   from '@config/mikro-orm.config';
import { AuthModule }       from '@modules/auth/auth.module';
import { JwtModule }        from '@modules/jwt/jwt.module';
import { MailerModule }     from '@modules/mailer/mailer.module';
import { UsersModule }      from '@modules/users/users.module';

import { AppService }      from './app.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerConfig } from '@config/throttler.config';

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
    JwtModule,
    MailerModule,
    AuthModule,
  ],
  controllers: [],
  providers: [ AppService ],
})
export class AppModule {}
