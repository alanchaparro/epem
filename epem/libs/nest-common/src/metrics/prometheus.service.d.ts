import { OnModuleInit } from '@nestjs/common';
import { Counter, Histogram } from 'prom-client';
import { PrometheusOptions } from './prometheus.constants';
export declare class PrometheusService implements OnModuleInit {
    private readonly options?;
    private readonly registry;
    readonly httpRequestsTotal: Counter<string>;
    readonly httpRequestDurationSeconds: Histogram<string>;
    constructor(options?: PrometheusOptions | undefined);
    onModuleInit(): void;
    get contentType(): string;
    getMetrics(): Promise<string>;
}
