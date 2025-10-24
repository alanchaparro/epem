import type { InjectionToken } from '@nestjs/common';

export interface PrometheusOptions {
  defaultServiceName?: string;
}

export const PROMETHEUS_OPTIONS: InjectionToken = Symbol('PROMETHEUS_OPTIONS');
