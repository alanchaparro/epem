import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  health() {
    return {
      status: 'ok',
      service: 'users-service',
      timestamp: new Date().toISOString(),
    };
  }
}

