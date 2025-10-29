import { Body, Controller, Delete, Get, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { Roles, RolesGuard } from '@epem/nest-common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesService } from './roles.service';

@Controller('roles')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get()
  list() {
    return this.service.list();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Put(':role')
  update(@Param('role') role: string, @Body() body: any) {
    return this.service.update(role, body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() body: { role: string; displayName?: string; modules?: any }) {
    return this.service.create(body);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':role')
  remove(@Param('role') role: string) {
    return this.service.remove(role);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async myPolicy(@Request() req: any) {
    const role: string = req.user?.role || 'STAFF';
    return this.service.getPolicy(role);
  }
}
