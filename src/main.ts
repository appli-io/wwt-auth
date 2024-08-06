import './config/instrument.config';

import { Logger, ValidationPipe }                 from '@nestjs/common';
import { ConfigService }                          from '@nestjs/config';
import { NestFactory, Reflector }                 from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule }         from '@nestjs/swagger';

import fastifyCsrfProtection from '@fastify/csrf-protection';
import fastifyCookie         from '@fastify/cookie';
import fastifyCors           from '@fastify/cors';
import fastifyCompress       from '@fastify/compress';
import fastifyHelmet         from '@fastify/helmet';

import { HttpLoggingInterceptor } from '@common/interceptors/http-logging.interceptor';
import { RedisIoAdapter }         from '@config/adapters/redis-io.adapter';
import { AppModule }              from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 10485760
    }),
    {snapshot: true}
  );
  const configService = app.get(ConfigService);
  const logger: Logger = new Logger('Bootstrap');

  app.setGlobalPrefix('api');
  await app.register(fastifyCompress as any, {global: false});
  await app.register(fastifyCookie as any, {secret: configService.get<string>('COOKIE_SECRET')});
  await app.register(fastifyHelmet as any);
  await app.register(fastifyCsrfProtection as any, {cookieOpts: {signed: true}});
  await app.register(fastifyCors as any, {
    credentials: true,
    origin: '*'
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true
    })
  );

  app.useGlobalInterceptors(new HttpLoggingInterceptor(new Reflector()));
  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();
  app.useWebSocketAdapter(redisIoAdapter);

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Authentication API')
    .setDescription('An OAuth2.0 authentication API made with NestJS')
    .setVersion('0.0.1')
    .addBearerAuth()
    .addTag('Authentication API')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.get<number>('port'), '::');
  logger.log(`Application is running on: ${ await app.getUrl() }`);
}

bootstrap().then();
