import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { UsersProxyController } from './users/users.controller';
import { PatientsProxyController } from './patients/patients.controller';
import { CatalogProxyController } from './catalog/catalog.controller';

/**
 * Módulo raíz del API Gateway.
 * - Carga variables de entorno (.env) a nivel global.
 * - Registra HttpModule para comunicarse con los microservicios.
 * - Declara controladores de salud, auth, users-proxy y patients-proxy.
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    HttpModule,
  ],
  controllers: [AppController, AuthController, UsersProxyController, PatientsProxyController, CatalogProxyController],
  providers: [AppService],
})
export class AppModule {}
