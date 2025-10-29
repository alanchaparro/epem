import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());
  const port = process.env.BILLING_SERVICE_PORT ?? 3040;
  try {
    const cfg = new DocumentBuilder()
      .setTitle('EPEM Billing Service')
      .setDescription('Servicio de Facturación y Visaciones')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const doc = SwaggerModule.createDocument(app, cfg);
    SwaggerModule.setup('docs', app, doc);
  } catch {}
  await app.listen(port);
  console.log(`Billing service ready on port ${port}`);
}

bootstrap();


