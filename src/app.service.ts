import { MikroORM }                                                          from '@mikro-orm/core';
import { Injectable, Logger, LoggerService, OnModuleDestroy, OnModuleInit, } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleDestroy {
  private readonly loggerService: LoggerService;

  constructor(
    private readonly orm: MikroORM,
  ) {
    this.loggerService = new Logger(AppService.name);
  }

  public async onModuleDestroy() {
    this.loggerService.log('Closing database connection');
    await this.orm.close();
    this.loggerService.log('Closed database connection');
  }
}
