import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('db')
  async db() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ok', db: true, timestamp: new Date().toISOString() };
    } catch (error: any) {
      return {
        status: 'error',
        db: false,
        message: error?.message ?? 'DB check failed',
        timestamp: new Date().toISOString(),
      };
    }
  }
}

