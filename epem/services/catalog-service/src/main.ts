import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  app.use(helmet());
  const port = process.env.CATALOG_SERVICE_PORT ?? 3030;
  try {
    const cfg = new DocumentBuilder()
      .setTitle('EPEM Catalog Service')
      .setDescription('Servicio de Catálogo')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const doc = SwaggerModule.createDocument(app, cfg);
    SwaggerModule.setup('docs', app, doc);
  } catch {}
  await app.listen(port);
  console.log(`Catalog service ready on port ${port}`);
}

bootstrap();


