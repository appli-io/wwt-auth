import { Injectable, Logger, LoggerService, OnModuleDestroy, OnModuleInit, } from '@nestjs/common';
import { ConfigService }                                                     from '@nestjs/config';

import { MikroORM } from '@mikro-orm/core';

import { IConfig }            from '@config/interfaces/config.interface';
import { OAuthProvidersEnum } from '@modules/users/enums/oauth-providers.enum';
import { UsersService }       from '@modules/users/users.service';

export interface CreateUserDto {
  provider: OAuthProvidersEnum;
  email: string;
  name: string;
  password: string;
  confirmed: boolean;
}

@Injectable()
export class AppService implements OnModuleInit, OnModuleDestroy {
  private readonly loggerService: LoggerService;

  constructor(
    private readonly _orm: MikroORM,
    private readonly _userService: UsersService,
    private readonly _configService: ConfigService<IConfig>,
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

  public async seedUsers() {
    // Seed adminUser
    const users: CreateUserDto[] = [
      {
        provider: OAuthProvidersEnum.LOCAL,
        email: 'david.misa97@gmail.com',
        name: 'David Misael Villegas Sandoval',
        password: this._configService.get('prefilledUserPassword', {infer: true}),
        confirmed: true
      }
    ];

    const promises = users.map(async (user) => {
      try {

        // Check if user already exists
        const existingUser = await this._userService.findOneByEmail(user.email);
        // If exist user, do nothing
        if (existingUser) return;
        await this._userService.create(user.provider, user.email, user.name, user.password, user.confirmed);
      } catch (e) {
        console.error(e);
      }
    });
  }
}
