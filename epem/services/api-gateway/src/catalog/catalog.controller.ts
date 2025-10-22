import { Body, Controller, Get, Headers, HttpException, HttpStatus, Param, Patch, Post, Query } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

// Proxy /catalog hacia catalog-service
@Controller('catalog')
export class CatalogProxyController {
  constructor(private readonly http: HttpService) {}
  private baseUrl() { return process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3030'; }

  @Post('items')
  async create(@Body() payload: any, @Headers('authorization') authorization?: string) {
    const { data } = await firstValueFrom(
      this.http.post(`${this.baseUrl()}/catalog/items`, payload, { headers: authorization ? { authorization } : undefined }).pipe(
        catchError((error) => { const s = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR; const m = error.response?.data ?? 'Error al comunicarse con catalog-service'; throw new HttpException(m, s); }),
      ),
    );
    return data;
  }

  @Get('items')
  async list(@Query() query: any, @Headers('authorization') authorization?: string) {
    const params = new URLSearchParams(query);
    const url = `${this.baseUrl()}/catalog/items${params.toString() ? `?${params}` : ''}`;
    const { data } = await firstValueFrom(
      this.http.get(url, { headers: authorization ? { authorization } : undefined }).pipe(
        catchError((error) => { const s = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR; const m = error.response?.data ?? 'Error al comunicarse con catalog-service'; throw new HttpException(m, s); }),
      ),
    );
    return data;
  }

  @Get('items/:id')
  async get(@Param('id') id: string, @Headers('authorization') authorization?: string) {
    const { data } = await firstValueFrom(
      this.http.get(`${this.baseUrl()}/catalog/items/${id}`, { headers: authorization ? { authorization } : undefined }).pipe(
        catchError((error) => { const s = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR; const m = error.response?.data ?? 'Error al comunicarse con catalog-service'; throw new HttpException(m, s); }),
      ),
    );
    return data;
  }

  @Patch('items/:id')
  async patch(@Param('id') id: string, @Body() payload: any, @Headers('authorization') authorization?: string) {
    const { data } = await firstValueFrom(
      this.http.patch(`${this.baseUrl()}/catalog/items/${id}`, payload, { headers: authorization ? { authorization } : undefined }).pipe(
        catchError((error) => { const s = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR; const m = error.response?.data ?? 'Error al comunicarse con catalog-service'; throw new HttpException(m, s); }),
      ),
    );
    return data;
  }
}

