import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';
import { PatientsService } from './patients.service';

@Controller('patients')
export class PatientsController {
  constructor(private readonly patients: PatientsService) {}

  @Post()
  create(@Body() dto: CreatePatientDto) {
    return this.patients.create(dto);
  }

  @Get()
  findAll(@Query('q') q?: string, @Query('skip') skip?: string, @Query('take') take?: string) {
    return this.patients.findAll({ q, skip: skip ? Number(skip) : undefined, take: take ? Number(take) : undefined });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.patients.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePatientDto) {
    return this.patients.update(id, dto);
  }
}
