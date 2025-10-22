import 'dotenv/config';
import 'reflect-metadata';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AdminSeederService } from './bootstrap/admin-seeder.service';
import { PrismaService } from './prisma/prisma.service';

async function bootstrap() {
  const origins = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean);
  const app = await NestFactory.create(AppModule, {
    cors: origins && origins.length > 0 ? { origin: origins, credentials: true } : { origin: true, credentials: true },
  });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const adminSeeder = app.get(AdminSeederService);
  await adminSeeder.run();

  const port = process.env.USERS_SERVICE_PORT ?? 3020;
  await app.listen(port);
  console.log(`Users service ready on port ${port}`);
}

bootstrap();
