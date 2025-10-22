import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminSeederService {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(private readonly configService: ConfigService, private readonly usersService: UsersService) {}

  async run() {
    const email = this.configService.get<string>('ADMIN_EMAIL');
    const password = this.configService.get<string>('ADMIN_PASSWORD');

    if (!email || !password) {
      this.logger.warn('ADMIN_EMAIL o ADMIN_PASSWORD no están definidos. Se omite la creación del administrador.');
      return;
    }

    const firstName = this.configService.get<string>('ADMIN_FIRST_NAME', 'Admin');
    const lastName = this.configService.get<string>('ADMIN_LAST_NAME', 'EPEM');

    await this.usersService.ensureAdminUser({
      email,
      password,
      firstName,
      lastName,
    });

    this.logger.log(`Usuario administrador asegurado (${email}).`);
  }
}
