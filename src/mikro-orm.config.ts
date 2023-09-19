import { LoadStrategy, Options }          from '@mikro-orm/core';
import { defineConfig as definePGConfig } from '@mikro-orm/postgresql';

const baseOptions = {
  entities: [ 'dist/**/*.entity.js', 'dist/**/*.embeddable.js' ],
  entitiesTs: [ 'src/**/*.entity.ts', 'src/**/*.embeddable.ts' ],
  loadStrategy: LoadStrategy.JOINED,
  allowGlobalContext: true,
};

const config: Options = definePGConfig({
  ...baseOptions,
  clientUrl: process.env.DATABASE_URL,
});

export default config;
