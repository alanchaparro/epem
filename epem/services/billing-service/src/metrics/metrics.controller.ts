import { Controller, Get, Res } from '@nestjs/common';
import { PrometheusService, Public, Roles } from '@epem/nest-common';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Controller('metrics')
@Roles('ADMIN', 'BILLING')
export class MetricsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prometheusService: PrometheusService,
  ) {}

  @Get()
  async overview() {
    const [insurers, coverages, authorizationsGroup, invoicesGroup] = await Promise.all([
      this.prisma.insurer.count(),
      this.prisma.coverage.count(),
      this.prisma.authorization.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
      this.prisma.invoice.groupBy({
        by: ['status'],
        _count: { status: true },
      }),
    ]);

    const authorizationsByStatus: Record<string, number> = {};
    let authorizationsTotal = 0;
    for (const row of authorizationsGroup) {
      authorizationsByStatus[row.status] = row._count.status;
      authorizationsTotal += row._count.status;
    }

    const invoicesByStatus: Record<string, number> = {};
    let invoicesTotal = 0;
    for (const row of invoicesGroup) {
      invoicesByStatus[row.status] = row._count.status;
      invoicesTotal += row._count.status;
    }

    return {
      insurers: {
        total: insurers,
      },
      coverages: {
        total: coverages,
      },
      authorizations: {
        total: authorizationsTotal,
        byStatus: authorizationsByStatus,
      },
      invoices: {
        total: invoicesTotal,
        byStatus: invoicesByStatus,
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


