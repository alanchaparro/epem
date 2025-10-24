import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());
  const port = process.env.BILLING_SERVICE_PORT ?? 3040;
  await app.listen(port);
  console.log(`Billing service ready on port ${port}`);
}

bootstrap();


