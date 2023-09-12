import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyCsrfProtection from '@fastify/csrf-protection';
import fastifyHelmet from '@fastify/helmet';
import {ValidationPipe} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter(),
  );
  const configService = app.get(ConfigService);
  await app.register(fastifyCookie as any, {
    secret: configService.get<string>('COOKIE_SECRET'),
  });
  await app.register(fastifyHelmet as any);
  await app.register(fastifyCsrfProtection as any, {cookieOpts: {signed: true}});
  await app.register(fastifyCors as any, {
    credentials: true,
    origin: `https://${configService.get<string>('domain')}`,
  });
  app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
      }),
  );

  const swaggerConfig = new DocumentBuilder()
      .setTitle('NestJS Authentication API')
      .setDescription('An OAuth2.0 authentication API made with NestJS')
      .setVersion('0.0.1')
      .addBearerAuth()
      .addTag('Authentication API')
      .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(
      configService.get<number>('port'),
      configService.get<boolean>('testing') ? '127.0.0.1' : '0.0.0.0',
  );
}

bootstrap();
