import { Injectable, Logger, LoggerService, OnModuleDestroy, OnModuleInit, } from '@nestjs/common';

import { MikroORM }           from '@mikro-orm/core';
import { OAuthProvidersEnum } from '@modules/users/enums/oauth-providers.enum';

export interface CreateUserDto {
  provider: OAuthProvidersEnum;
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  confirmed: boolean;
}

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly loggerService: LoggerService;

  constructor(
    private readonly _orm: MikroORM,
  ) {
    this.loggerService = new Logger(AppService.name);
  }

  public async onModuleInit() {
    const updateDump = await this._orm.getSchemaGenerator().getUpdateSchemaSQL();

    if (updateDump) {
      await this._orm.getSchemaGenerator().updateSchema();
    } else {
      console.log('El esquema está actualizado.');
    }
  }

  public async onModuleDestroy() {
    this.loggerService.log('Closing database connection');
    await this._orm.close();
    this.loggerService.log('Closed database connection');
  }
}
