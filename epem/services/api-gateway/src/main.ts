import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PORT ?? process.env.API_GATEWAY_PORT ?? 4000;
  await app.listen(port);
  console.log(`API Gateway ready on port ${port}`);
}

bootstrap();
