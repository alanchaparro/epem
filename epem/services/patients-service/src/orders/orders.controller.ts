import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '../../generated/client';
import { Roles } from '@epem/nest-common';

@Controller('orders')
@Roles('ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE', 'STAFF', 'BILLING')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(@Body() dto: CreateOrderDto) {
    return this.ordersService.create(dto);
  }

  @Get()
  findAll(@Query('status') status?: string) {
    const parsed = status ? (status.toUpperCase() as keyof typeof OrderStatus) : undefined;
    const statusEnum = parsed ? OrderStatus[parsed] : undefined;
    return this.ordersService.findAll(statusEnum);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, dto);
  }
}


