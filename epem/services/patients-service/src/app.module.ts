import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PatientsController } from './patients/patients.controller';
import { PatientsService } from './patients/patients.service';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    PrismaModule,
    OrdersModule,
  ],
  controllers: [AppController, PatientsController],
  providers: [AppService, PatientsService],
})
export class AppModule {}
