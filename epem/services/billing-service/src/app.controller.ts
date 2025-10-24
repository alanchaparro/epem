import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from '@epem/nest-common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get('health')
  health() {
    return this.appService.health();
  }
}


