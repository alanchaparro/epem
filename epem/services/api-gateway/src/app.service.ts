import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      dependencies: [
        { name: 'patients-service', url: process.env.PATIENTS_SERVICE_URL ?? 'http://localhost:3010' },
        { name: 'users-service', url: process.env.USERS_SERVICE_URL ?? 'http://localhost:3020' },
        { name: 'catalog-service', url: process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3030' },
        { name: 'billing-service', url: process.env.BILLING_SERVICE_URL ?? 'http://localhost:3040' }
      ]
    };
  }
}
