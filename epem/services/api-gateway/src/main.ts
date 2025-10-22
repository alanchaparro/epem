import 'dotenv/config';
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * Bootstrap del API Gateway.
 * - Expone endpoints de autenticación (/auth/*) y proxies a microservicios (/users/*, /patients/*, ...)
 * - CORS: se configura con CORS_ORIGIN (coma-separado) o abierto en desarrollo.
 * - Puerto: controlado por la variable de entorno API_GATEWAY_PORT.
 */

async function bootstrap() {
  // Permite definir orígenes permitidos separados por comas en CORS_ORIGIN
  const origins = process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()).filter(Boolean);
  const app = await NestFactory.create(AppModule, {
    cors: origins && origins.length > 0 ? { origin: origins, credentials: true } : { origin: true, credentials: true },
  });
  // Fijamos el puerto del gateway (evita usar PORT para que no colisione con otras apps)
  const port = process.env.API_GATEWAY_PORT ?? 4000;
  await app.listen(port);
  console.log(`API Gateway ready on port ${port}`);
}

bootstrap();
