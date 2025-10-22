import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthController } from './auth/auth.controller';
import { UsersProxyController } from './users/users.controller';
import { PatientsProxyController } from './patients/patients.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['../../.env', '.env'],
    }),
    HttpModule,
  ],
  controllers: [AppController, AuthController, UsersProxyController, PatientsProxyController],
  providers: [AppService],
})
export class AppModule {}
