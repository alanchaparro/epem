import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

@Controller('orders')
export class OrdersProxyController {
  constructor(private readonly http: HttpService) {}

  private baseUrl() {
    return process.env.PATIENTS_SERVICE_URL ?? 'http://localhost:3010';
  }

  private forward<T = any>(method: 'get' | 'post' | 'patch', path: string, body?: any, authorization?: string) {
    const headers = authorization ? { authorization } : undefined;
    const request$ = this.http[method](`${this.baseUrl()}${path}`, body, { headers }).pipe(
      catchError((error) => {
        const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.response?.data ?? 'Error al comunicarse con patients-service';
        throw new HttpException(message, status);
      }),
    );
    return firstValueFrom(request$).then((res) => res.data as T);
  }

  @Post()
  create(@Body() payload: any, @Headers('authorization') authorization?: string) {
    return this.forward('post', '/orders', payload, authorization);
  }

  @Get()
  findAll(@Query('status') status?: string, @Headers('authorization') authorization?: string) {
    const path = status ? `/orders?status=${encodeURIComponent(status)}` : '/orders';
    return this.forward('get', path, undefined, authorization);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() payload: any, @Headers('authorization') authorization?: string) {
    return this.forward('patch', `/orders/${id}/status`, payload, authorization);
  }
}
