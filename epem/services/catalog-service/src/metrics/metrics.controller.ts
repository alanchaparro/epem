import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusService, Public, Roles } from '@epem/nest-common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Controller('metrics')
@Roles('ADMIN', 'SUPERVISOR', 'DOCTOR', 'BILLING')
export class MetricsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prometheusService: PrometheusService,
  ) {}

  @Get()
  async overview() {
    const [total, activeCount, inactiveCount] = await Promise.all([
      this.prisma.serviceItem.count(),
      this.prisma.serviceItem.count({ where: { active: true } }),
      this.prisma.serviceItem.count({ where: { active: false } }),
    ]);

    return {
      serviceItems: {
        total,
        active: activeCount,
        inactive: inactiveCount,
      },
    };
  }

  @Public()
  @Get('prometheus')
  async prometheus(@Res() res: Response) {
    res.setHeader('Content-Type', this.prometheusService.contentType);
    return res.send(await this.prometheusService.getMetrics());
  }
}


