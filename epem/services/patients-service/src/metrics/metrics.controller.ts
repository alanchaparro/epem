import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusService, Public, Roles } from '@epem/nest-common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Controller('metrics')
@Roles('ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE', 'STAFF', 'BILLING')
export class MetricsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prometheusService: PrometheusService,
  ) {}

  @Get()
  async overview() {
    const [patientsTotal, ordersGroup] = await Promise.all([
      this.prisma.patient.count(),
      this.prisma.order.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const ordersByStatus: Record<string, number> = {};
    let ordersTotal = 0;
    for (const row of ordersGroup) {
      ordersByStatus[row.status] = row._count.status;
      ordersTotal += row._count.status;
    }

    return {
      patients: {
        total: patientsTotal,
      },
      orders: {
        total: ordersTotal,
        byStatus: ordersByStatus,
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


