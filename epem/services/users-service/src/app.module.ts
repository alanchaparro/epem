import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { PROMETHEUS_OPTIONS, PrometheusInterceptor, PrometheusService } from '@epem/nest-common';
import { AdminSeederService } from './bootstrap/admin-seeder.service';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { HealthController } from './health.controller';
import { MetricsController } from './metrics/metrics.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    PrismaModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController, HealthController, MetricsController],
  providers: [
    AppService,
    AdminSeederService,
    {
      provide: PROMETHEUS_OPTIONS,
      useValue: { defaultServiceName: 'users-service' },
    },
    PrometheusService,
    {
      provide: APP_INTERCEPTOR,
      useClass: PrometheusInterceptor,
    },
  ],
})
export class AppModule {}


