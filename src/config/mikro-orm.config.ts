import { Injectable }    from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { MikroOrmModuleOptions, MikroOrmOptionsFactory, } from '@mikro-orm/nestjs';

@Injectable()
export class MikroOrmConfig implements MikroOrmOptionsFactory {
  constructor( private readonly configService: ConfigService ) {}

  public createMikroOrmOptions(): MikroOrmModuleOptions {
    return this.configService.get<MikroOrmModuleOptions>('db');
  }
}