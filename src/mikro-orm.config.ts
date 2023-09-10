import { LoadStrategy, Options } from '@mikro-orm/core';
import { defineConfig } from '@mikro-orm/postgresql';

const config: Options = defineConfig({
  clientUrl: process.env.DATABASE_URL,
  entities: ['dist/**/*.entity.js', 'dist/**/*.embeddable.js'],
  entitiesTs: ['src/**/*.entity.ts', 'src/**/*.embeddable.ts'],
  loadStrategy: LoadStrategy.JOINED,
  allowGlobalContext: true,
});

export default config;