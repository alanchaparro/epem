import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import './observability/otel';
import { AppModule } from './app.module';
import { randomUUID } from 'crypto';
import type { Request, Response, NextFunction } from 'express';

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
  app.use(helmet({ crossOriginResourcePolicy: false }));
  // Request ID propagation
  app.use((req: Request, res: Response, next: NextFunction) => {
    const rid = (req.headers['x-request-id'] as string | undefined) || randomUUID();
    (req as any).requestId = rid;
    res.setHeader('x-request-id', rid);
    next();
  });
  // Basic JSON request logging with requestId
  app.use((req: Request, res: Response, next: NextFunction) => {
    const t0 = Date.now();
    res.on('finish', () => {
      try {
        const log = {
          level: 'info',
          msg: 'http',
          method: req.method,
          url: (req.originalUrl || req.url).split('?')[0],
          status: res.statusCode,
          durationMs: Date.now() - t0,
          requestId: res.getHeader('x-request-id') || (req as any).requestId,
          service: process.env.SERVICE_NAME || 'api-gateway',
        };
        // eslint-disable-next-line no-console
        console.log(JSON.stringify(log));
      } catch {}
    });
    next();
  });
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
  // Swagger docs
  try {
    const cfg = new DocumentBuilder()
      .setTitle('EPEM Gateway')
      .setDescription('API Gateway de EPEM')
      .setVersion('1.0.0')
      .addBearerAuth()
      .build();
    const doc = SwaggerModule.createDocument(app, cfg);
    SwaggerModule.setup('docs', app, doc);
  } catch {}

  await app.listen(port);
  console.log(`API Gateway ready on port ${port}`);
}

bootstrap();

