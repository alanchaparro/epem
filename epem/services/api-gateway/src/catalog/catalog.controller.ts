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
import { TTLCache } from '../common/cache';

type AuthenticatedRequest = Request & { user?: { sub?: string; id?: string; role?: string } };

@Controller('catalog')
@Roles('ADMIN', 'SUPERVISOR', 'DOCTOR', 'BILLING')
export class CatalogProxyController {
  private cache: TTLCache<any>;
  constructor(private readonly http: HttpService, private readonly config: ConfigService) {
    const ttl = parseInt(this.config.get<string>('CATALOG_CACHE_TTL_MS') ?? '5000', 10);
    this.cache = new TTLCache<any>(isFinite(ttl) ? ttl : 5000);
  }

  private baseUrl() {
    return this.config.get<string>('CATALOG_SERVICE_URL') ?? 'http://localhost:3030';
  }

  private buildHeaders(
    authorization?: string,
    user?: { sub?: string; id?: string; role?: string },
    method?: string,
    urlPath?: string,
    requestId?: string,
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
    if (method && urlPath) {
      Object.assign(headers, signGatewayHeaders({ method, urlPath, userId, role: user?.role }));
    }
    return headers;
  }

  @Post('items')
  async create(
    @Body() payload: any,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const res = await firstValueFrom(
      this.http
        .post<any>(`${this.baseUrl()}/catalog/items`, payload, {
          headers: this.buildHeaders(authorization, req?.user, 'POST', '/catalog/items', (req as any)?.requestId),
        })
        .pipe(mapAxiosError("gateway-proxy")),
    );
    // invalidar cache de listas
    this.cache.del('list:');
    return (res as any).data;
  }

  @Get('items')
  async list(
    @Query() query: Record<string, string>,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const params = new URLSearchParams(query);
    const urlPath = `/catalog/items${params.toString() ? `?${params}` : ''}`;
    const url = `${this.baseUrl()}${urlPath}`;
    const cacheKey = `list:${params.toString()}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    const res = await firstValueFrom(
      this.http
        .get<any>(url, {
          headers: this.buildHeaders(authorization, req?.user, 'GET', '/catalog/items', (req as any)?.requestId),
        })
        .pipe(mapAxiosError("gateway-proxy")),
    );
    const out = (res as any).data;
    this.cache.set(cacheKey, out);
    return out;
  }

  @Get('items/:id')
  async get(
    @Param('id') id: string,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const cacheKey = `item:${id}`;
    const cached = this.cache.get(cacheKey);
    if (cached) return cached;
    const res = await firstValueFrom(
      this.http
        .get<any>(`${this.baseUrl()}/catalog/items/${id}`, {
          headers: this.buildHeaders(authorization, req?.user, 'GET', `/catalog/items/${id}`, (req as any)?.requestId),
        })
        .pipe(mapAxiosError("gateway-proxy")),
    );
    const out = (res as any).data;
    this.cache.set(cacheKey, out);
    return out;
  }

  @Patch('items/:id')
  async patch(
    @Param('id') id: string,
    @Body() payload: any,
    @Headers('authorization') authorization?: string,
    @Req() req?: AuthenticatedRequest,
  ) {
    const res = await firstValueFrom(
      this.http
        .patch<any>(`${this.baseUrl()}/catalog/items/${id}`, payload, {
          headers: this.buildHeaders(authorization, req?.user, 'PATCH', `/catalog/items/${id}`, (req as any)?.requestId),
        })
        .pipe(mapAxiosError("gateway-proxy")),
    );
    // invalidar cache del item y listas
    this.cache.del(`item:${id}`);
    this.cache.del('list:');
    return (res as any).data;
  }
}




