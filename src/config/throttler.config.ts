import { Injectable }                                       from '@nestjs/common';
import { ConfigService }                                    from '@nestjs/config';
import { ThrottlerModuleOptions, ThrottlerOptionsFactory, } from '@nestjs/throttler';
import { RedisOptions }                                     from 'ioredis';
import { ThrottlerStorageRedisService }                     from 'nestjs-throttler-storage-redis';
import { ThrottlerOptions }                                 from '@nestjs/throttler/dist/throttler-module-options.interface';

@Injectable()
export class ThrottlerConfig implements ThrottlerOptionsFactory {
  constructor(private readonly configService: ConfigService) {
  }

  createThrottlerOptions = (): ThrottlerModuleOptions =>
    this.configService.get<boolean>('testing')
      ? {throttlers: [ {...this.configService.get<ThrottlerOptions>('throttler')} ]}
      : {
        throttlers: [ {...this.configService.get<ThrottlerOptions>('throttler')} ],
        storage: new ThrottlerStorageRedisService(
          this.configService.get<RedisOptions>('redis'),
        ),
      };
}
