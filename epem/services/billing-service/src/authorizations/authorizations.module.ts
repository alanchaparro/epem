import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthorizationsController } from './authorizations.controller';
import { AuthorizationsService } from './authorizations.service';

@Module({
  imports: [PrismaModule, HttpModule],
  controllers: [AuthorizationsController],
  providers: [AuthorizationsService],
  exports: [AuthorizationsService],
})
export class AuthorizationsModule {}
