import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { RedisOptions }          from 'ioredis';
import { IEmailConfig }          from './email-config.interface';
import { IJwt }                  from './jwt.interface';
import { IOAuth2 }               from './oauth2.interface';
import { ThrottlerOptions }      from '@nestjs/throttler/dist/throttler-module-options.interface';

export interface IConfig {
  readonly env: string;
  readonly id: string;
  readonly url: string;
  readonly port: number;
  readonly domain: string;
  readonly prefilledUserPassword: string;
  readonly crypto: { key: string };
  readonly db: MikroOrmModuleOptions;
  readonly redis: RedisOptions;
  readonly jwt: IJwt;
  readonly emailService: IEmailConfig;
  readonly throttler: ThrottlerOptions;
  readonly testing: boolean;
  readonly oauth2: IOAuth2;
  readonly firebase: any;
}
