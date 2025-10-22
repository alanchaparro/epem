import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const origins = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean);
  const app = await NestFactory.create(AppModule, {
    cors: origins && origins.length > 0 ? { origin: origins, credentials: true } : { origin: true, credentials: true },
  });
  const port = process.env.PORT ?? process.env.API_GATEWAY_PORT ?? 4000;
  await app.listen(port);
  console.log(`API Gateway ready on port ${port}`);
}

bootstrap();
