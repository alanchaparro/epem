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

@Controller('catalog')
@Roles('ADMIN', 'SUPERVISOR', 'DOCTOR', 'BILLING')
export class CatalogProxyController {
  constructor(private readonly http: HttpService) {}

  private baseUrl() {
    return process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3030';
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

  @Post('items')
  async create(
    @Body() payload: any,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const { data } = await firstValueFrom(
      this.http
        .post(`${this.baseUrl()}/catalog/items`, payload, {
          headers: this.buildHeaders(authorization, req?.user),
        })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con catalog-service';
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }

  @Get('items')
  async list(
    @Query() query: Record<string, string>,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const params = new URLSearchParams(query);
    const url = `${this.baseUrl()}/catalog/items${params.toString() ? `?${params}` : ''}`;
    const { data } = await firstValueFrom(
      this.http
        .get(url, {
          headers: this.buildHeaders(authorization, req?.user),
        })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con catalog-service';
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }

  @Get('items/:id')
  async get(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const { data } = await firstValueFrom(
      this.http
        .get(`${this.baseUrl()}/catalog/items/${id}`, {
          headers: this.buildHeaders(authorization, req?.user),
        })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con catalog-service';
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }

  @Patch('items/:id')
  async patch(
    @Param('id') id: string,
    @Body() payload: any,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const { data } = await firstValueFrom(
      this.http
        .patch(`${this.baseUrl()}/catalog/items/${id}`, payload, {
          headers: this.buildHeaders(authorization, req?.user),
        })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con catalog-service';
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }
}


