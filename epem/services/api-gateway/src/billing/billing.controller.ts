import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

@Controller('billing')
export class BillingProxyController {
  constructor(private readonly http: HttpService) {}

  private baseUrl() {
    return process.env.BILLING_SERVICE_URL ?? 'http://localhost:3040';
  }

  private forward<T = any>(method: 'get' | 'post' | 'patch', path: string, payload?: any, authorization?: string) {
    const headers = authorization ? { authorization } : undefined;
    const request$ = this.http[method](`${this.baseUrl()}${path}`, payload, { headers }).pipe(
      catchError((error) => {
        const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.response?.data ?? 'Error al comunicarse con billing-service';
        throw new HttpException(message, status);
      }),
    );
    return firstValueFrom(request$).then((res) => res.data as T);
  }

  @Get('insurers')
  listInsurers(@Headers('authorization') authorization?: string) {
    return this.forward('get', '/insurers', undefined, authorization);
  }

  @Get('insurers/:id')
  getInsurer(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    return this.forward('get', `/insurers/${id}`, undefined, authorization);
  }

  @Post('insurers')
  createInsurer(@Body() payload: any, @Headers('authorization') authorization?: string) {
    return this.forward('post', '/insurers', payload, authorization);
  }

  @Patch('insurers/:id')
  updateInsurer(@Param('id') id: string, @Body() payload: any, @Headers('authorization') authorization?: string) {
    return this.forward('patch', `/insurers/${id}`, payload, authorization);
  }

  @Get('coverage')
  listCoverage(@Query('insurerId') insurerId: string, @Headers('authorization') authorization?: string) {
    if (!insurerId) {
      throw new HttpException('insurerId es requerido', HttpStatus.BAD_REQUEST);
    }
    const path = `/coverage?insurerId=${encodeURIComponent(insurerId)}`;
    return this.forward('get', path, undefined, authorization);
  }

  @Post('coverage')
  createCoverage(@Body() payload: any, @Headers('authorization') authorization?: string) {
    return this.forward('post', '/coverage', payload, authorization);
  }

  @Patch('coverage/:id')
  updateCoverage(@Param('id') id: string, @Body() payload: any, @Headers('authorization') authorization?: string) {
    return this.forward('patch', `/coverage/${id}`, payload, authorization);
  }
}
