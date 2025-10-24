import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import {
  PROMETHEUS_OPTIONS,
  PrometheusInterceptor,
  PrometheusService,
  RolesGuard,
} from '@epem/nest-common';
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
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
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
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}


