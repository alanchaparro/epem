import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

@Catch()
export class ProblemDetailsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    const requestId = (res.getHeader('x-request-id') as string) || (req as any)?.requestId || '';

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();
      const message = (response as any)?.message ?? (response as any)?.error ?? exception.message;
      const detail = Array.isArray(message) ? message.join(' ') : String(message);
      res
        .status(status)
        .type('application/problem+json')
        .send({
          type: 'about:blank',
          title: HttpStatus[status] || 'Error',
          status,
          detail,
          instance: req.originalUrl || req.url,
          requestId,
        });
      return;
    }

    const status = HttpStatus.INTERNAL_SERVER_ERROR;
    res
      .status(status)
      .type('application/problem+json')
      .send({
        type: 'about:blank',
        title: 'Internal Server Error',
        status,
        detail: 'Unexpected error',
        instance: req.originalUrl || req.url,
        requestId,
      });
  }
}

