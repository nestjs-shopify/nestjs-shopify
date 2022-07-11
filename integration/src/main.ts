import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './with-hybrid-auth/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true });

  await app.listen(3000);
  Logger.log(`Listening on port 3000: http://localhost:3000/`);
}

bootstrap();
