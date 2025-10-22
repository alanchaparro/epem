import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { ItemsService } from './items.service';

// Controlador REST del catálogo en /catalog/items
@Controller('catalog/items')
export class ItemsController {
  constructor(private readonly items: ItemsService) {}

  @Post()
  create(@Body() dto: CreateItemDto) {
    return this.items.create(dto);
  }

  @Get()
  findAll(@Query('q') q?: string, @Query('skip') skip?: string, @Query('take') take?: string, @Query('active') active?: string) {
    return this.items.findAll({ q, skip: skip ? Number(skip) : undefined, take: take ? Number(take) : undefined, active: active === undefined ? undefined : active === 'true' });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.items.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateItemDto) {
    return this.items.update(id, dto);
  }
}

