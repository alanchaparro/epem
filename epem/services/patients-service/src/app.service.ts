import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'patients-service',
      timestamp: new Date().toISOString(),
    };
  }
}

