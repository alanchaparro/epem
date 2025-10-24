import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { PrometheusService } from './prometheus.service';
export declare class PrometheusInterceptor implements NestInterceptor {
    private readonly prometheus;
    constructor(prometheus: PrometheusService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown>;
}
