import { mapAxiosError } from '../common/http-error.util';
import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import { signGatewayHeaders } from '../common/signing.util';
import { ConfigService } from '@nestjs/config';

/**
 * Proxy /users hacia el users-service.
 * - ReenvÃ­a el header Authorization.
 * - Ejemplo: GET /users/me â†’ users-service /api/users/me
 */
type AuthenticatedRequest = Request & { user?: { sub?: string; id?: string; role?: string } };
@Controller('users')

export class UsersProxyController {
  constructor(private readonly http: HttpService, private readonly config: ConfigService) {}

  private buildHeaders(
    authorization?: string,
    user?: { sub?: string; id?: string; role?: string },
    method?: string,
    urlPath?: string,
    requestId?: string,
  ) {
    const headers: Record<string, string> = {};
    if (authorization) headers.authorization = authorization;
    const userId = user?.sub ?? user?.id;
    if (userId) headers['x-user-id'] = String(userId);
    if (user?.role) headers['x-user-role'] = String(user.role);
    if (requestId) headers['x-request-id'] = requestId;
    if (method && urlPath) Object.assign(headers, signGatewayHeaders({ method, urlPath, userId, role: user?.role }));
    return headers;
  }

  @Get('me')
  async me(@Headers('authorization') authorization?: string, @Req() req?: AuthenticatedRequest) {
    const usersServiceUrl = this.config.get<string>('USERS_SERVICE_URL') ?? 'http://localhost:3020';
    const { data } = await firstValueFrom(
      this.http
        .get<any>(`${usersServiceUrl}/api/users/me`, {
          headers: this.buildHeaders(authorization, req?.user, 'GET', '/api/users/me', (req as any)?.requestId),
        })
        .pipe(
          mapAxiosError("gateway-proxy"),
        ),
    );
    return data;
  }

  @Get()
  async list(
    @Headers('authorization') authorization?: string,
    @Query('q') q?: string,
    @Query('skip') skip?: string,
    @Query('take') take?: string,
    @Query('onlyActive') onlyActive?: string,
    @Req() req?: AuthenticatedRequest) {
    const usersServiceUrl = this.config.get<string>('USERS_SERVICE_URL') ?? 'http://localhost:3020';
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (skip) params.set('skip', String(skip));
    if (take) params.set('take', String(take));
    if (onlyActive) params.set('onlyActive', String(onlyActive));
    const url = `${usersServiceUrl}/api/users${params.toString() ? `?${params.toString()}` : ''}`;
    const { data } = await firstValueFrom(
      this.http
        .get<any>(url, { headers: this.buildHeaders(authorization, req?.user, 'GET', '/api/users', (req as any)?.requestId) })
        .pipe(
          mapAxiosError("gateway-proxy"),
        ),
    );
    return data;
  }

  @Post()
  async create(@Body() body: any, @Headers('authorization') authorization?: string, @Req() req?: AuthenticatedRequest) {
    const usersServiceUrl = this.config.get<string>('USERS_SERVICE_URL') ?? 'http://localhost:3020';
    const { data } = await firstValueFrom(
      this.http
        .post<any>(`${usersServiceUrl}/api/users`, body, { headers: this.buildHeaders(authorization, req?.user, 'POST', '/api/users', (req as any)?.requestId) })
        .pipe(
          mapAxiosError("gateway-proxy"),
        ),
    );
    return data;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @Headers('authorization') authorization?: string, @Req() req?: AuthenticatedRequest) {
    const usersServiceUrl = this.config.get<string>('USERS_SERVICE_URL') ?? 'http://localhost:3020';
    const { data } = await firstValueFrom(
      this.http
        .patch<any>(`${usersServiceUrl}/api/users/${id}`, body, { headers: this.buildHeaders(authorization, req?.user, 'PATCH', `/api/users/${id}`, (req as any)?.requestId) })
        .pipe(
          mapAxiosError("gateway-proxy"),
        ),
    );
    return data;
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Headers('authorization') authorization?: string, @Req() req?: AuthenticatedRequest) {
    const usersServiceUrl = this.config.get<string>('USERS_SERVICE_URL') ?? 'http://localhost:3020';
    const { data } = await firstValueFrom(
      this.http
        .delete<any>(`${usersServiceUrl}/api/users/${id}`, { headers: this.buildHeaders(authorization, req?.user, 'DELETE', `/api/users/${id}`, (req as any)?.requestId) })
        .pipe(
          mapAxiosError("gateway-proxy"),
        ),
    );
    return data;
  }
}




