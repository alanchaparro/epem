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

@Controller('patients')
@Roles('ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE', 'STAFF')
export class PatientsProxyController {
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
  async create(
    @Body() payload: any,
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    const { data } = await firstValueFrom(
      this.http
        .post(`${this.baseUrl()}/patients`, payload, {
          headers: this.buildHeaders(authorization, req.user),
        })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con patients-service';
            throw new HttpException(message, status);
          }),
        ),
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
    const url = `${this.baseUrl()}/patients${params.toString() ? `?${params}` : ''}`;

    const { data } = await firstValueFrom(
      this.http
        .get(url, {
          headers: this.buildHeaders(authorization, req?.user),
        })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con patients-service';
            throw new HttpException(message, status);
          }),
        ),
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
        .get(`${this.baseUrl()}/patients/${id}`, {
          headers: this.buildHeaders(authorization, req?.user),
        })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con patients-service';
            throw new HttpException(message, status);
          }),
        ),
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
        .patch(`${this.baseUrl()}/patients/${id}`, payload, {
          headers: this.buildHeaders(authorization, req?.user),
        })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con patients-service';
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }
}


