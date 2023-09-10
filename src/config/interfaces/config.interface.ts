import { MikroOrmModuleOptions } from '@mikro-orm/nestjs';
import { RedisOptions }          from 'ioredis';

import { IEmailConfig } from './email-config.interface';
import { IJwt }         from './jwt.interface';

export interface IConfig {
  id: string;
  port: number;
  domain: string;
  db: MikroOrmModuleOptions;
  jwt: IJwt;
  emailService: IEmailConfig;
  redis: RedisOptions;
}