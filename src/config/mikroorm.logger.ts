import { Connection, IDatabaseDriver, MikroORM } from '@mikro-orm/core';
import { Injectable, OnModuleInit }              from '@nestjs/common';

@Injectable()
export class MikroOrmLogger implements OnModuleInit {
  constructor(private readonly orm: MikroORM<IDatabaseDriver<Connection>>) {}

  onModuleInit() {
    this.orm.config.set('logger', (message: string) => {
      if (message.startsWith('query:')) {
        const start = Date.now();

        const logQueryExecution = () => {
          const end = Date.now();
          console.log(`Query executed in ${ end - start }ms`);
        };

        // Si la consulta es una promesa, puedes usar then para loguear después de que se complete
        const originalQuery = this.orm.em.getConnection().execute;
        this.orm.em.getConnection().execute = async (...args: any[]) => {
          const result = await originalQuery.apply(this.orm.em.getConnection(), args);
          logQueryExecution();
          return result;
        };
      }
    });
  }
}
