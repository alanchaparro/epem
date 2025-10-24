import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { PrometheusService } from './prometheus.service';

@Injectable()
export class PrometheusInterceptor implements NestInterceptor {
  constructor(private readonly prometheus: PrometheusService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const httpContext = context.switchToHttp();
    const request = httpContext.getRequest<Request>();
    const response = httpContext.getResponse<Response>();

    if (!request || !response) {
      return next.handle();
    }

    const route = request.route?.path ?? request.path ?? request.url;
    if (route.startsWith('/metrics')) {
      return next.handle();
    }

    const method = request.method ?? 'UNKNOWN';
    const timer = this.prometheus.httpRequestDurationSeconds.startTimer();

    return next.handle().pipe(
      tap({
        next: () => {
          const status = response.statusCode ?? 200;
          const labels = { method, route, status: status.toString() };
          this.prometheus.httpRequestsTotal.inc(labels);
          timer(labels);
        },
        error: (err: any) => {
          const status = err?.status ?? err?.statusCode ?? 500;
          const labels = { method, route, status: status.toString() };
          this.prometheus.httpRequestsTotal.inc(labels);
          timer(labels);
        },
      }),
    );
  }
}
