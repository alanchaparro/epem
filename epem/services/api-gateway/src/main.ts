import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap del API Gateway.
 * - Expone endpoints de autenticación y proxies hacia los microservicios.
 * - CORS: restringido a CORS_ORIGIN (separado por comas) o a DEFAULT_ORIGIN (fallback).
 * - Puerto: controlado por API_GATEWAY_PORT (por defecto 4000).
 */

async function bootstrap() {
  const configuredOrigins =
    process.env.CORS_ORIGIN
      ?.split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0) ?? [];
  const fallbackOrigin = process.env.DEFAULT_ORIGIN ?? 'http://localhost:3000';
  const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : [fallbackOrigin];

  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: (requestOrigin, callback) => {
      if (!requestOrigin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(requestOrigin)) {
        return callback(null, true);
      }
      return callback(new Error('Origin not allowed by CORS policy'), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With', 'Accept'],
    exposedHeaders: ['Content-Disposition'],
  });

  const port = process.env.API_GATEWAY_PORT ?? 4000;
  await app.listen(port);
  console.log(`API Gateway ready on port ${port}`);
}

bootstrap();

