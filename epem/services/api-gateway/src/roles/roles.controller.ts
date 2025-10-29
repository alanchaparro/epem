import { Body, Controller, Delete, Get, Headers, HttpException, HttpStatus, Param, Post, Put } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

@Controller('roles')
export class RolesProxyController {
  constructor(private readonly http: HttpService) {}

  @Get()
  async list(@Headers('authorization') authorization?: string) {
    const usersServiceUrl = process.env.USERS_SERVICE_URL ?? 'http://localhost:3020';
    const { data } = await firstValueFrom(
      this.http
        .get(`${usersServiceUrl}/api/roles`, { headers: authorization ? { authorization } : undefined })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con users-service';
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }

  @Put(':role')
  async update(@Param('role') role: string, @Body() body: any, @Headers('authorization') authorization?: string) {
    const usersServiceUrl = process.env.USERS_SERVICE_URL ?? 'http://localhost:3020';
    const { data } = await firstValueFrom(
      this.http
        .put(`${usersServiceUrl}/api/roles/${role}`, body, { headers: authorization ? { authorization } : undefined })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con users-service';
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }

  @Get('me')
  async my(@Headers('authorization') authorization?: string) {
    const usersServiceUrl = process.env.USERS_SERVICE_URL ?? 'http://localhost:3020';
    const { data } = await firstValueFrom(
      this.http
        .get(`${usersServiceUrl}/api/roles/me`, { headers: authorization ? { authorization } : undefined })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con users-service';
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }

  @Post()
  async create(@Body() body: any, @Headers('authorization') authorization?: string) {
    const usersServiceUrl = process.env.USERS_SERVICE_URL ?? 'http://localhost:3020';
    const { data } = await firstValueFrom(
      this.http
        .post(`${usersServiceUrl}/api/roles`, body, { headers: authorization ? { authorization } : undefined })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con users-service';
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }

  @Delete(':role')
  async remove(@Param('role') role: string, @Headers('authorization') authorization?: string) {
    const usersServiceUrl = process.env.USERS_SERVICE_URL ?? 'http://localhost:3020';
    const { data } = await firstValueFrom(
      this.http
        .delete(`${usersServiceUrl}/api/roles/${role}`, { headers: authorization ? { authorization } : undefined })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? 'Error al comunicarse con users-service';
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }
}
