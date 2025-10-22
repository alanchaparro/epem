import { Controller, Get, Headers, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';

@Controller('users')
export class UsersProxyController {
  constructor(private readonly http: HttpService) {}

  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    const usersServiceUrl = process.env.USERS_SERVICE_URL ?? 'http://localhost:3020';
    const { data } = await firstValueFrom(
      this.http
        .get(`${usersServiceUrl}/api/users/me`, {
          headers: authorization ? { authorization } : undefined,
        })
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
