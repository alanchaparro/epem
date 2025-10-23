import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { InsurersModule } from './insurers/insurers.module';
import { CoverageModule } from './coverage/coverage.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['../../.env', '.env'] }),
    PrismaModule,
    InsurersModule,
    CoverageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
