import { HttpService } from '@nestjs/axios';
import { Controller, Get, Headers, HttpException, HttpStatus, Req, Res } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import type { Request } from 'express';
import type { Response } from 'express';
import { Public, PrometheusService, Roles } from '@epem/nest-common';

type AuthenticatedRequest = Request & { user?: { sub?: string; id?: string; role?: string } };

@Controller('analytics')
@Roles('ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE', 'STAFF', 'BILLING')
export class AnalyticsController {
  constructor(
    private readonly http: HttpService,
    private readonly prometheus: PrometheusService,
  ) {}

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

  private async fetchMetrics(
    baseUrl: string,
    authorization: string | undefined,
    user?: { sub?: string; id?: string; role?: string },
  ) {
    const { data } = await firstValueFrom(
      this.http
        .get(`${baseUrl}/metrics`, {
          headers: this.buildHeaders(authorization, user),
        })
        .pipe(
          catchError((error) => {
            const status = error.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
            const message = error.response?.data ?? `Error al comunicarse con ${baseUrl}`;
            throw new HttpException(message, status);
          }),
        ),
    );
    return data;
  }

  private resolveServiceUrls() {
    const patients = process.env.PATIENTS_SERVICE_URL ?? 'http://localhost:3010';
    const catalog = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3030';
    const billing = process.env.BILLING_SERVICE_URL ?? 'http://localhost:3040';
    const rawUsers = (process.env.USERS_SERVICE_URL ?? 'http://localhost:3020').replace(/\/$/, '');
    const users = rawUsers.endsWith('/api') ? rawUsers : `${rawUsers}/api`;
    return { patients, catalog, billing, users };
  }

  @Get('metrics')
  async overview(@Headers('authorization') authorization: string | undefined, @Req() req: AuthenticatedRequest) {
    const urls = this.resolveServiceUrls();

    const [patients, catalog, billing, users] = await Promise.all([
      this.fetchMetrics(urls.patients, authorization, req.user),
      this.fetchMetrics(urls.catalog, authorization, req.user),
      this.fetchMetrics(urls.billing, authorization, req.user),
      this.fetchMetrics(urls.users, authorization, req.user),
    ]);

    return {
      patients,
      catalog,
      billing,
      users,
    };
  }

  @Public()
  @Get('prometheus')
  async prometheusAggregate(
    @Headers('authorization') authorization: string | undefined,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const patientsUrl = process.env.PATIENTS_SERVICE_URL ?? 'http://localhost:3010';
    const catalogUrl = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3030';
    const billingUrl = process.env.BILLING_SERVICE_URL ?? 'http://localhost:3040';
    const rawUsersUrl = (process.env.USERS_SERVICE_URL ?? 'http://localhost:3020').replace(/\/$/, '');
    const usersUrl = rawUsersUrl.endsWith('/api') ? rawUsersUrl : `${rawUsersUrl}/api`;

    const sections: string[] = [];
    sections.push(`# metrics: api-gateway`);
    sections.push(await this.prometheus.getMetrics());

    const targets = [
      { name: 'patients-service', url: patientsUrl },
      { name: 'catalog-service', url: catalogUrl },
      { name: 'billing-service', url: billingUrl },
      { name: 'users-service', url: usersUrl },
    ];

    for (const target of targets) {
      try {
        const response = await firstValueFrom(
          this.http.get<string>(`${target.url}/metrics/prometheus`, {
            headers: this.buildHeaders(authorization, req.user),
            responseType: 'text' as 'json',
          }),
        );
        sections.push(`# metrics: ${target.name}`);
        sections.push(response.data);
      } catch (error: any) {
        const status = error?.response?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
        const message = error?.response?.data ?? error?.message ?? 'unknown error';
        sections.push(`# metrics: ${target.name} unavailable (${status})`);
        sections.push(`# message: ${message}`);
      }
    }

    res.setHeader('Content-Type', this.prometheus.contentType);
    return res.send(sections.join('\n'));
  }
}

