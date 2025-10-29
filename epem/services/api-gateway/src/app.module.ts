import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { PrometheusInterceptor, PrometheusService, PROMETHEUS_OPTIONS, RolesGuard, ProblemDetailsFilter } from '@epem/nest-common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { UsersProxyController } from './users/users.controller';
import { PatientsProxyController } from './patients/patients.controller';
import { CatalogProxyController } from './catalog/catalog.controller';
import { BillingProxyController } from './billing/billing.controller';
import { OrdersProxyController } from './orders/orders.controller';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AnalyticsController } from './analytics/analytics.controller';
import { MetricsController } from './metrics/metrics.controller';
import { RolesProxyController } from './roles/roles.controller';
import { validateEnv } from './config/env.validation';
import { HttpConfigurer } from './common/http-configurer';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validate: validateEnv,
    }),
    HttpModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET ?? 'change-me',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL ?? '60', 10),
        limit: parseInt(process.env.RATE_LIMIT_MAX ?? '120', 10),
      },
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    UsersProxyController,
    PatientsProxyController,
    CatalogProxyController,
    BillingProxyController,
    OrdersProxyController,
    AnalyticsController,
    MetricsController,
    RolesProxyController,
  ],
  providers: [
    AppService,
    HttpConfigurer,
    {
      provide: PROMETHEUS_OPTIONS,
      useValue: { defaultServiceName: 'api-gateway' },
    },
    PrometheusService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrometheusInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
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
