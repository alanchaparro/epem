import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInsurerDto } from './dto/create-insurer.dto';
import { UpdateInsurerDto } from './dto/update-insurer.dto';

@Injectable()
export class InsurersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.insurer.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const insurer = await this.prisma.insurer.findUnique({ where: { id } });
    if (!insurer) throw new NotFoundException('Aseguradora no encontrada');
    return insurer;
  }

  async create(dto: CreateInsurerDto) {
    try {
      return await this.prisma.insurer.create({ data: dto });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('planCode ya está en uso');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdateInsurerDto) {
    await this.findOne(id);
    try {
      return await this.prisma.insurer.update({ where: { id }, data: dto });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('planCode ya está en uso');
      }
      throw e;
    }
  }
}

