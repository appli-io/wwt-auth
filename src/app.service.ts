import { MikroORM }                                                          from '@mikro-orm/core';
import { Injectable, Logger, LoggerService, OnModuleDestroy, OnModuleInit, } from '@nestjs/common';
import { ConfigService }                                                     from '@nestjs/config';

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly loggerService: LoggerService;
  private readonly testing: boolean;

  constructor(
    private readonly orm: MikroORM,
    private readonly configService: ConfigService,
  ) {
    this.loggerService = new Logger(AppService.name);
    this.testing = this.configService.get('testing');
  }

  public async onModuleInit() {
    const updateDump = await this.orm.getSchemaGenerator().getUpdateSchemaSQL();
    const createDump = await this.orm.getSchemaGenerator().getCreateSchemaSQL();
    console.log('createDump', createDump);

    if (updateDump) {
      console.log('Actualizando esquema...');
      console.log(updateDump);
      await this.orm.getSchemaGenerator().updateSchema();
    } else {
      console.log('El esquema está actualizado.');
    }
  }

  public async onModuleDestroy() {
    this.loggerService.log('Closing database connection');
    await this.orm.close();
    this.loggerService.log('Closed database connection');
  }
}
