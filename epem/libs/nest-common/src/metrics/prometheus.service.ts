import { Inject, Injectable, OnModuleInit, Optional } from '@nestjs/common';
import { collectDefaultMetrics, Counter, Histogram, Registry } from 'prom-client';
import { PROMETHEUS_OPTIONS, PrometheusOptions } from './prometheus.constants';

@Injectable()
export class PrometheusService implements OnModuleInit {
  private readonly registry = new Registry();
  readonly httpRequestsTotal: Counter<string>;
  readonly httpRequestDurationSeconds: Histogram<string>;

  constructor(
    @Optional()
    @Inject(PROMETHEUS_OPTIONS)
    private readonly options?: PrometheusOptions,
  ) {
    const serviceName = process.env.SERVICE_NAME ?? this.options?.defaultServiceName ?? 'epem-service';
    this.registry.setDefaultLabels({ service: serviceName });

    this.httpRequestsTotal = new Counter({
      name: 'http_requests_total',
      help: 'Total HTTP requests processed',
      labelNames: ['method', 'route', 'status'],
      registers: [this.registry],
    });

    this.httpRequestDurationSeconds = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    collectDefaultMetrics({ register: this.registry });
  }

  get contentType(): string {
    return this.registry.contentType;
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }
}
