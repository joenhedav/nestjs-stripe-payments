import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { envs } from './config/envs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // saca del body cualquier campo que no esté en el DTO
      forbidNonWhitelisted: true, // si mandan un campo extra, responde 400 en vez de ignorarlo
    }),
  );

  await app.listen(envs.PORT);
}
void bootstrap();
