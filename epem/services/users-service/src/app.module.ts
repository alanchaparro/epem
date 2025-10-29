import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PROMETHEUS_OPTIONS, PrometheusInterceptor, PrometheusService, ProblemDetailsFilter } from '@epem/nest-common';
import { AdminSeederService } from './bootstrap/admin-seeder.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { RolesController } from './roles/roles.controller';
import { RolesService } from './roles/roles.service';
import { HealthController } from './health.controller';
import { MetricsController } from './metrics/metrics.controller';
import { validateEnv } from './config/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
      validate: validateEnv,
    }),
    JwtModule.register({ global: true, secret: process.env.JWT_SECRET ?? 'change-me' }),
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController, HealthController, MetricsController, RolesController],
  providers: [
    AppService,
    AdminSeederService,
    RolesService,
    {
      provide: PROMETHEUS_OPTIONS,
      useValue: { defaultServiceName: 'users-service' },
    },
    PrometheusService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrometheusInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: ProblemDetailsFilter,
    },
  ],
})
export class AppModule {}


