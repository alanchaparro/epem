import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

/**
 * Proxy /patients hacia patients-service.
 * - Implementa create, list, get y patch.
 * - Acepta query params (q, skip, take) para la búsqueda paginada.
 */
@Controller('patients')
export class PatientsProxyController {
  constructor(private readonly http: HttpService) {}

  private baseUrl() {
    return process.env.PATIENTS_SERVICE_URL ?? 'http://localhost:3010';
  }

  @Post()
  async create(@Body() payload: any, @Headers('authorization') authorization?: string) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.baseUrl()}/patients`, payload, { headers: authorization ? { authorization } : undefined }).pipe(
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
  async list(@Query('q') q?: string, @Query('skip') skip?: string, @Query('take') take?: string, @Headers('authorization') authorization?: string) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (skip) params.set('skip', skip);
    if (take) params.set('take', take);
    const url = `${this.baseUrl()}/patients${params.toString() ? `?${params}` : ''}`;

    const { data } = await firstValueFrom(
      this.http.get(url, { headers: authorization ? { authorization } : undefined }).pipe(
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
  async get(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl()}/patients/${id}`, { headers: authorization ? { authorization } : undefined }).pipe(
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
  async patch(@Param('id') id: string, @Body() payload: any, @Headers('authorization') authorization?: string) {
    const { data } = await firstValueFrom(
      this.http.patch(`${this.baseUrl()}/patients/${id}`, payload, { headers: authorization ? { authorization } : undefined }).pipe(
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
