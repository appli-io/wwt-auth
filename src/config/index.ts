import { LoadStrategy }                   from '@mikro-orm/core';
import { defineConfig as definePGConfig } from '@mikro-orm/postgresql';
import { PostgreSqlOptions }              from '@mikro-orm/postgresql/PostgreSqlMikroORM';
import { readFileSync }                   from 'fs';
import * as process                       from 'node:process';
import { join }                           from 'path';

import { isUndefined }    from '@common/utils/validation.util';
import { IConfig }        from './interfaces/config.interface';
import { redisUrlParser } from './utils/redis-url-parser.util';

export function config(): IConfig {
  const publicKey = readFileSync(
    join(__dirname, '..', '..', 'keys/public.key'),
    'utf-8',
  );
  const privateKey = readFileSync(
    join(__dirname, '..', '..', 'keys/private.key'),
    'utf-8',
  );
  const testing = process.env.NODE_ENV !== 'production';
  const dbOptions: PostgreSqlOptions = {
    entities: [ 'dist/**/*.entity.js', 'dist/**/*.embeddable.js' ],
    entitiesTs: [ 'src/**/*.entity.ts', 'src/**/*.embeddable.ts' ],
    loadStrategy: LoadStrategy.JOINED,
    allowGlobalContext: true,
    forceUtcTimezone: true
  };

  return {
    env: process.env.NODE_ENV,
    id: process.env.APP_ID,
    url: process.env.URL,
    port: parseInt(process.env.PORT, 10),
    domain: process.env.DOMAIN,
    jwt: {
      access: {
        privateKey,
        publicKey,
        time: parseInt(process.env.JWT_ACCESS_TIME, 10),
      },
      confirmation: {
        secret: process.env.JWT_CONFIRMATION_SECRET,
        time: parseInt(process.env.JWT_CONFIRMATION_TIME, 10),
      },
      resetPassword: {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        time: parseInt(process.env.JWT_RESET_PASSWORD_TIME, 10),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        time: parseInt(process.env.JWT_REFRESH_TIME, 10),
      },
    },
    emailService: {
      service: 'gmail',
      auth: {
        type: 'OAUTH2',
        user: process.env.EMAIL_USER,
        clientId: process.env.EMAIL_CLIENT_ID,
        clientSecret: process.env.EMAIL_CLIENT_SECRET,
        refreshToken: process.env.EMAIL_CLIENT_REFRESH_TOKEN,
      },
    },
    db: definePGConfig({
      ...dbOptions,
      clientUrl: process.env.DATABASE_URL,
    }),
    redis: redisUrlParser(process.env.REDIS_URL),
    throttler: {
      ttl: parseInt(process.env.THROTTLE_TTL, 10),
      limit: parseInt(process.env.THROTTLE_LIMIT, 10),
    },
    testing,
    oauth2: {
      microsoft:
        isUndefined(process.env.MICROSOFT_CLIENT_ID) ||
        isUndefined(process.env.MICROSOFT_CLIENT_SECRET)
          ? null
          : {
            id: process.env.MICROSOFT_CLIENT_ID,
            secret: process.env.MICROSOFT_CLIENT_SECRET,
          },
      google:
        isUndefined(process.env.GOOGLE_CLIENT_ID) ||
        isUndefined(process.env.GOOGLE_CLIENT_SECRET)
          ? null
          : {
            id: process.env.GOOGLE_CLIENT_ID,
            secret: process.env.GOOGLE_CLIENT_SECRET,
          },
      facebook:
        isUndefined(process.env.FACEBOOK_CLIENT_ID) ||
        isUndefined(process.env.FACEBOOK_CLIENT_SECRET)
          ? null
          : {
            id: process.env.FACEBOOK_CLIENT_ID,
            secret: process.env.FACEBOOK_CLIENT_SECRET,
          },
      github:
        isUndefined(process.env.GITHUB_CLIENT_ID) ||
        isUndefined(process.env.GITHUB_CLIENT_SECRET)
          ? null
          : {
            id: process.env.GITHUB_CLIENT_ID,
            secret: process.env.GITHUB_CLIENT_SECRET,
          },
    },
    firebase: {
      storage: {
        bucket: process.env.STORAGE_BUCKET,
      },
      type: process.env.TYPE,
      projectId: process.env.PROJECT_ID,
      privateKeyId: process.env.PRIVATE_KEY_ID,
      privateKey: JSON.parse(process.env.PRIVATE_KEY).privateKey,
      clientEmail: process.env.CLIENT_EMAIL,
      clientId: process.env.CLIENT_ID,
      authUri: process.env.AUTH_URI,
      tokenUri: process.env.TOKEN_URI,
      authProviderX509CertUrl: process.env.AUTH_PROVIDER_X509_CERT_URL,
      clientX509CertUrl: process.env.CLIENT_X509_CERT_URL,
      universeDomain: process.env.UNIVERSE_DOMAIN,
    }
  };
}
