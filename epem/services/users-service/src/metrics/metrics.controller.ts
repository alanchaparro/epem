import { Controller, Get, Res, UseGuards } from '@nestjs/common';
import { PrometheusService, Public, Roles, RolesGuard } from '@epem/nest-common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('metrics')
export class MetricsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly prometheusService: PrometheusService,
  ) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPERVISOR')
  @Get()
  async overview() {
    const total = await this.prisma.user.count();
    const grouped = await this.prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });
    const byRole: Record<string, number> = {};
    for (const row of grouped) {
      byRole[row.role] = row._count.role;
    }
    return {
      users: {
        total,
        byRole,
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


