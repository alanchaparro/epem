import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { InsurersService } from './insurers.service';
import { CreateInsurerDto } from './dto/create-insurer.dto';
import { UpdateInsurerDto } from './dto/update-insurer.dto';

@Controller('insurers')
export class InsurersController {
  constructor(private readonly insurers: InsurersService) {}

  @Get()
  findAll() {
    return this.insurers.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.insurers.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInsurerDto) {
    return this.insurers.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateInsurerDto) {
    return this.insurers.update(id, dto);
  }
}
