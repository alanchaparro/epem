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
import { InsurersModule } from './insurers/insurers.module';
import { CoverageModule } from './coverage/coverage.module';
import { AuthorizationsModule } from './authorizations/authorizations.module';
import { InvoicesModule } from './invoices/invoices.module';
import { MetricsController } from './metrics/metrics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'], validate: require('./config/env.validation').validateEnv }),
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET ?? 'change-me' }),
    PrismaModule,
    InsurersModule,
    CoverageModule,
    AuthorizationsModule,
    InvoicesModule,
  ],
  controllers: [AppController, MetricsController],
  providers: [
    AppService,
    {
      provide: PROMETHEUS_OPTIONS,
      useValue: { defaultServiceName: 'billing-service' },
    },
    PrometheusService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrometheusInterceptor,
    },
    // Bind Roles before Jwt so Jwt can run first if execution is reverse order
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ProblemDetailsFilter,
    },
  ],
})
export class AppModule {}


