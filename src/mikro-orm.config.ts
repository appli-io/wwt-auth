import { LoadStrategy, Options }          from '@mikro-orm/core';
import { defineConfig as definePGConfig } from '@mikro-orm/postgresql';
import { PostgreSqlOptions }              from '@mikro-orm/postgresql/PostgreSqlMikroORM';

const baseOptions: PostgreSqlOptions = {
  entities: [ 'dist/**/*.entity.js', 'dist/**/*.embeddable.js' ],
  entitiesTs: [ 'src/**/*.entity.ts', 'src/**/*.embeddable.ts' ],
  migrations: {
    // path: 'dist/migrations',
    pathTs: 'src/migrations',
    dropTables: false,
    emit: 'ts',
    snapshot: true,

  },
  loadStrategy: LoadStrategy.JOINED,
  allowGlobalContext: true,
};

const config: Options = definePGConfig({
  ...baseOptions,
  clientUrl: process.env.DATABASE_URL,
});

export default config;
