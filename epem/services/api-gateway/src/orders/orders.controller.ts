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
import { catchError, firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { Roles } from '@epem/nest-common';

type AuthenticatedRequest = Request & { user?: { sub?: string; id?: string; role?: string } };

@Controller('orders')
@Roles('ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE', 'STAFF', 'BILLING')
export class OrdersProxyController {
  constructor(private readonly http: HttpService) {}

  private baseUrl() {
    return process.env.PATIENTS_SERVICE_URL ?? 'http://localhost:3010';
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

  @Post()
  create(
    @Body() payload: any,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const request$ = this.http
      .post(`${this.baseUrl()}/orders`, payload, {
        headers: this.buildHeaders(authorization, req.user),
      })
      .pipe(
        catchError((error) => {
          const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
          const message = error.response?.data ?? 'Error al comunicarse con patients-service';
          throw new HttpException(message, status);
        }),
      );
    return firstValueFrom(request$).then((res) => res.data);
  }

  @Get()
  findAll(
    @Query('status') status?: string,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const path = status ? `/orders?status=${encodeURIComponent(status)}` : '/orders';
    const request$ = this.http
      .get(`${this.baseUrl()}${path}`, {
        headers: this.buildHeaders(authorization, req?.user),
      })
      .pipe(
        catchError((error) => {
          const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
          const message = error.response?.data ?? 'Error al comunicarse con patients-service';
          throw new HttpException(message, status);
        }),
      );
    return firstValueFrom(request$).then((res) => res.data);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() payload: any,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const request$ = this.http
      .patch(`${this.baseUrl()}/orders/${id}/status`, payload, {
        headers: this.buildHeaders(authorization, req?.user),
      })
      .pipe(
        catchError((error) => {
          const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
          const message = error.response?.data ?? 'Error al comunicarse con patients-service';
          throw new HttpException(message, status);
        }),
      );
    return firstValueFrom(request$).then((res) => res.data);
  }
}


