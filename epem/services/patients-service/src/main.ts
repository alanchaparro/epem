import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const port = process.env.PATIENTS_SERVICE_PORT ?? 3010;
  await app.listen(port);
  console.log(`Patients service ready on port ${port}`);
}

bootstrap();
