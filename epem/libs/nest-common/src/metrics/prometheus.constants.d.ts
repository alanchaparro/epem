import type { InjectionToken } from '@nestjs/common';
export interface PrometheusOptions {
    defaultServiceName?: string;
}
export declare const PROMETHEUS_OPTIONS: InjectionToken;
