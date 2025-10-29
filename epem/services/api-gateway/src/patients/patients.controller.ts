import { mapAxiosError } from '../common/http-error.util';
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
import { ConfigService } from '@nestjs/config';
import { catchError, firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { Roles } from '@epem/nest-common';
import { signGatewayHeaders } from '../common/signing.util';

type AuthenticatedRequest = Request & { user?: { sub?: string; id?: string; role?: string } };

@Controller('patients')
@Roles('ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE', 'STAFF')
export class PatientsProxyController {
  constructor(private readonly http: HttpService, private readonly config: ConfigService) {}

  private baseUrl() {
    return this.config.get<string>('PATIENTS_SERVICE_URL') ?? 'http://localhost:3010';
  }

  private buildHeaders(
    authorization?: string,
    user?: { sub?: string; id?: string; role?: string },
    requestId?: string,
    method?: string,
    urlPath?: string,
  ) {
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
    if (requestId) headers['x-request-id'] = requestId;
    // Firmar encabezados si hay secreto compartido
    if (method && urlPath) {
      const signed = signGatewayHeaders({ method, urlPath, userId, role: user?.role });
      Object.assign(headers, signed);
    }
    return headers;
  }

  @Post()
  async create(
    @Body() payload: any,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const { data } = await firstValueFrom(
      this.http
        .post<any>(`${this.baseUrl()}/patients`, payload, {
          headers: this.buildHeaders(authorization, req.user, (req as any)?.requestId, 'POST', '/patients'),
        })
        .pipe(mapAxiosError("gateway-proxy")),
    );
    return data;
  }

  @Get()
  async list(
    @Query('q') q?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (skip) params.set('skip', skip);
    if (take) params.set('take', take);
    const urlPathOnly = `/patients${params.toString() ? `?${params}` : ''}`;
    const url = `${this.baseUrl()}${urlPathOnly}`;

    const { data } = await firstValueFrom(
      this.http
        .get<any>(url, {
          headers: this.buildHeaders(authorization, req?.user, (req as any)?.requestId, 'GET', `/patients`),
        })
        .pipe(mapAxiosError("gateway-proxy")),
    );
    return data;
  }

  @Get(':id')
  async get(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const { data } = await firstValueFrom(
      this.http
        .get<any>(`${this.baseUrl()}/patients/${id}`, {
          headers: this.buildHeaders(authorization, req?.user, (req as any)?.requestId, 'GET', `/patients/${id}`),
        })
        .pipe(mapAxiosError("gateway-proxy")),
    );
    return data;
  }

  @Patch(':id')
  async patch(
    @Param('id') id: string,
    @Body() payload: any,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const { data } = await firstValueFrom(
      this.http
        .patch<any>(`${this.baseUrl()}/patients/${id}`, payload, {
          headers: this.buildHeaders(authorization, req?.user, (req as any)?.requestId, 'PATCH', `/patients/${id}`),
        })
        .pipe(mapAxiosError("gateway-proxy")),
    );
    return data;
  }
}





