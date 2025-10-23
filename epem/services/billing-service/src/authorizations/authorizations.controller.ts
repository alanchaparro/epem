import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AuthorizationsService } from './authorizations.service';
import { CreateAuthorizationDto } from './dto/create-authorization.dto';
import { UpdateAuthorizationDto } from './dto/update-authorization.dto';
import { AuthorizationStatus } from '../../generated/client';

@Controller('authorizations')
export class AuthorizationsController {
  constructor(private readonly authorizations: AuthorizationsService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    const parsed = status ? (status.toUpperCase() as keyof typeof AuthorizationStatus) : undefined;
    const statusEnum = parsed ? AuthorizationStatus[parsed] : undefined;
    return this.authorizations.findAll(statusEnum);
  }

  @Post()
  create(@Body() dto: CreateAuthorizationDto) {
    return this.authorizations.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAuthorizationDto) {
    return this.authorizations.update(id, dto);
  }
}
