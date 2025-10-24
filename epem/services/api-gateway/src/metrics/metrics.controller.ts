import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrometheusService, Public } from '@epem/nest-common';

@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Public()
  @Get('prometheus')
  async prometheus(@Res() res: Response) {
    res.setHeader('Content-Type', this.prometheusService.contentType);
    return res.send(await this.prometheusService.getMetrics());
  }
}


