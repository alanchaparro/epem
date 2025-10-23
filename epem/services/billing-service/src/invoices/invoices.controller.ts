import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { InvoiceStatus } from '../../generated/client';

@Controller('invoices')
export class InvoicesController {
  constructor(private readonly invoices: InvoicesService) {}

  @Get()
  findAll(@Query('status') status?: string) {
    const parsed = status ? (status.toUpperCase() as keyof typeof InvoiceStatus) : undefined;
    const statusEnum = parsed ? InvoiceStatus[parsed] : undefined;
    return this.invoices.findAll(statusEnum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.invoices.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoices.create(dto);
  }

  @Patch(':id/issue')
  issue(@Param('id') id: string) {
    return this.invoices.issue(id);
  }
}
