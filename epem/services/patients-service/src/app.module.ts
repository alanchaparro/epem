import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import {
  PROMETHEUS_OPTIONS,
  PrometheusInterceptor,
  PrometheusService,
  RolesGuard,
  JwtAuthGuard,
  ProblemDetailsFilter,
} from '@epem/nest-common';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PatientsController } from './patients/patients.controller';
import { PatientsService } from './patients/patients.service';
import { OrdersModule } from './orders/orders.module';
import { MetricsController } from './metrics/metrics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validate: require('./config/env.validation').validateEnv,
    }),
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'change-me',
    }),
    PrismaModule,
    OrdersModule,
  ],
  controllers: [AppController, PatientsController, MetricsController],
  providers: [
    AppService,
    PatientsService,
    {
      provide: PROMETHEUS_OPTIONS,
      useValue: { defaultServiceName: 'patients-service' },
    },
    PrometheusService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrometheusInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ProblemDetailsFilter,
    },
  ],
})
export class AppModule {}


