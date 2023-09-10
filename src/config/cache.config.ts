import { Injectable, }                             from '@nestjs/common';
import { CacheModuleOptions, CacheOptionsFactory } from '@nestjs/common/cache';
import { ConfigService }                           from '@nestjs/config';

import { redisStore } from 'cache-manager-ioredis-yet';

@Injectable()
export class CacheConfig implements CacheOptionsFactory {
  constructor( private readonly configService: ConfigService ) {}

  async createCacheOptions(): Promise<CacheModuleOptions> {
    return {
      store: await redisStore({
        ...this.configService.get('redis'),
        ttl: this.configService.get<number>('jwt.refresh.time') * 1000,
      }),
    };
  }
}