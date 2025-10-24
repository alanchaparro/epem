import {
  Body,
  Controller,
  Get,
  Headers,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Roles } from '@epem/nest-common';
import { catchError, firstValueFrom } from 'rxjs';
import type { Request } from 'express';

type AuthenticatedRequest = Request & { user?: { sub?: string; id?: string; role?: string } };

@Controller('billing')
@Roles('ADMIN', 'BILLING')
export class BillingProxyController {
  constructor(private readonly http: HttpService) {}

  private baseUrl() {
    return process.env.BILLING_SERVICE_URL ?? 'http://localhost:3040';
  }

  private buildHeaders(authorization?: string, user?: { sub?: string; id?: string; role?: string }) {
    const headers: Record<string, string> = {};
    if (authorization) {
      headers.authorization = authorization;
    }
    const userId = user?.sub ?? user?.id;
    if (userId) {
      headers['x-user-id'] = userId.toString();
    }
    if (user?.role) {
      headers['x-user-role'] = user.role.toString();
    }
    return headers;
  }

  private forward<T = any>(
    method: 'get' | 'post' | 'patch',
    path: string,
    payload: any,
    authorization: string | undefined,
    user?: { sub?: string; id?: string; role?: string },
  ) {
    const request$ = this.http
      .request({
        method,
        url: `${this.baseUrl()}${path}`,
        data: payload,
        headers: this.buildHeaders(authorization, user),
      })
      .pipe(
      catchError((error) => {
        const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error.response?.data ?? 'Error al comunicarse con billing-service';
        throw new HttpException(message, status);
      }),
    );
    return firstValueFrom(request$).then((res) => res.data as T);
  }

  @Get('insurers')
  listInsurers(@Headers('authorization') authorization: string | undefined, @Req() req: AuthenticatedRequest) {
    return this.forward('get', '/insurers', undefined, authorization, req.user);
  }

  @Get('insurers/:id')
  getInsurer(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.forward('get', `/insurers/${id}`, undefined, authorization, req.user);
  }

  @Post('insurers')
  createInsurer(
    @Body() payload: any,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.forward('post', '/insurers', payload, authorization, req.user);
  }

  @Patch('insurers/:id')
  updateInsurer(
    @Param('id') id: string,
    @Body() payload: any,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.forward('patch', `/insurers/${id}`, payload, authorization, req.user);
  }

  @Get('coverage')
  listCoverage(
    @Query('insurerId') insurerId: string,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    if (!insurerId) {
      throw new HttpException('insurerId es requerido', HttpStatus.BAD_REQUEST);
    }
    const path = `/coverage?insurerId=${encodeURIComponent(insurerId)}`;
    return this.forward('get', path, undefined, authorization, req.user);
  }

  @Post('coverage')
  createCoverage(
    @Body() payload: any,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.forward('post', '/coverage', payload, authorization, req.user);
  }

  @Patch('coverage/:id')
  updateCoverage(
    @Param('id') id: string,
    @Body() payload: any,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.forward('patch', `/coverage/${id}`, payload, authorization, req.user);
  }

  @Get('authorizations')
  listAuthorizations(
    @Query('status') status: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const path = status ? `/authorizations?status=${encodeURIComponent(status)}` : '/authorizations';
    return this.forward('get', path, undefined, authorization, req.user);
  }

  @Post('authorizations')
  createAuthorization(
    @Body() payload: any,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.forward('post', '/authorizations', payload, authorization, req.user);
  }

  @Patch('authorizations/:id')
  updateAuthorization(
    @Param('id') id: string,
    @Body() payload: any,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.forward('patch', `/authorizations/${id}`, payload, authorization, req.user);
  }

  @Get('invoices')
  listInvoices(
    @Query('status') status: string | undefined,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const path = status ? `/invoices?status=${encodeURIComponent(status)}` : '/invoices';
    return this.forward('get', path, undefined, authorization, req.user);
  }

  @Get('invoices/:id')
  getInvoice(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.forward('get', `/invoices/${id}`, undefined, authorization, req.user);
  }

  @Post('invoices')
  createInvoice(
    @Body() payload: any,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.forward('post', '/invoices', payload, authorization, req.user);
  }

  @Patch('invoices/:id/issue')
  issueInvoice(
    @Param('id') id: string,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.forward('patch', `/invoices/${id}/issue`, {}, authorization, req.user);
  }
}

