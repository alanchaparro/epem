import { Controller, Get } from '@nestjs/common';
import { Public } from '@epem/nest-common';

@Controller()
export class AppController {
  @Public()
  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'users-service',
      timestamp: new Date().toISOString(),
    };
  }
}

