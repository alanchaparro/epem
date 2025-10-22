import { Body, Controller, HttpException, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import type { Request, Response } from 'express';

type LoginDto = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly http: HttpService) {}

  @Post('login')
  async login(@Body() payload: LoginDto, @Res({ passthrough: true }) res: Response) {
    const rawUrl = process.env.USERS_SERVICE_URL;
    const port = process.env.USERS_SERVICE_PORT ?? '3020';
    const usersServiceUrl = rawUrl && !rawUrl.includes('${') ? rawUrl : `http://localhost:${port}`;

    const { data } = await firstValueFrom(
      this.http.post(`${usersServiceUrl}/api/auth/login`, payload).pipe(
        catchError((error) => {
          const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
          const message = error.response?.data ?? 'Error al comunicarse con users-service';

          throw new HttpException(message, status);
        }),
      ),
    );
    if (data?.refreshToken) {
      const ttl = parseInt(process.env.REFRESH_TOKEN_TTL ?? '604800', 10);
      res.cookie('epem_rt', data.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: ttl * 1000,
        path: '/',
      });
      delete data.refreshToken;
    }
    return data;
  }

  @Post('refresh')
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const usersServiceUrl = process.env.USERS_SERVICE_URL ?? 'http://localhost:3020';
    const cookies = req.headers.cookie ?? '';
    const token = cookies.split(';').map((c) => c.trim()).find((c) => c.startsWith('epem_rt='))?.split('=')[1];
    if (!token) {
      throw new HttpException('No refresh token', HttpStatus.UNAUTHORIZED);
    }

    const { data } = await firstValueFrom(
      this.http.post(`${usersServiceUrl}/api/auth/refresh`, { refreshToken: token }).pipe(
        catchError((error) => {
          const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
          const message = error.response?.data ?? 'Error al comunicarse con users-service';
          throw new HttpException(message, status);
        }),
      ),
    );
    if (data?.refreshToken) {
      const ttl = parseInt(process.env.REFRESH_TOKEN_TTL ?? '604800', 10);
      res.cookie('epem_rt', data.refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: ttl * 1000,
        path: '/',
      });
      delete data.refreshToken;
    }
    return data;
  }

  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.cookie('epem_rt', '', { httpOnly: true, expires: new Date(0), path: '/' });
    return { ok: true };
  }
}
