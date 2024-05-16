import { MikroOrmModuleOptions, MikroOrmOptionsFactory, } from '@mikro-orm/nestjs';
import { Injectable }                                     from '@nestjs/common';
import { ConfigService }                                  from '@nestjs/config';

@Injectable()
export class MikroOrmConfig implements MikroOrmOptionsFactory {
  constructor(private readonly configService: ConfigService) {
  }

  public createMikroOrmOptions(): MikroOrmModuleOptions {
    console.log(this.configService.get<MikroOrmModuleOptions>('db.clientUrl'));
    return this.configService.get<MikroOrmModuleOptions>('db');
  }
}
