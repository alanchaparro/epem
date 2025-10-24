import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

// Servicio de dominio de Catálogo (CRUD + búsqueda)
@Injectable()
export class ItemsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateItemDto) {
    try {
      return await this.prisma.serviceItem.create({
        data: {
          code: dto.code,
          name: dto.name,
          description: dto.description,
          basePrice: new Prisma.Decimal(dto.basePrice),
          active: dto.active ?? true,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Código de prestación duplicado');
      }
      throw e;
    }
  }

  async findAll(params: { q?: string; skip?: number; take?: number; active?: boolean }) {
    const { q, skip = 0, take = 20, active } = params;
    const where: Prisma.ServiceItemWhereInput = {
      AND: [
        q
          ? {
              OR: [
                { code: { contains: q } },
                { name: { contains: q } },
                { description: { contains: q } },
              ],
            }
          : {},
        typeof active === 'boolean' ? { active } : {},
      ],
    };
    // Ejecutamos findMany + count dentro de la misma transacción para mantener paginación consistente.
    const [items, total] = await this.prisma.$transaction([
      this.prisma.serviceItem.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
      this.prisma.serviceItem.count({ where }),
    ]);
    return { items, total, skip, take };
  }

  async findOne(id: string) {
    const item = await this.prisma.serviceItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Prestación no encontrada');
    return item;
  }

  async update(id: string, dto: UpdateItemDto) {
    await this.findOne(id);
    try {
      return await this.prisma.serviceItem.update({
        where: { id },
        data: {
          ...dto,
          basePrice: dto.basePrice !== undefined ? new Prisma.Decimal(dto.basePrice) : undefined,
        },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new ConflictException('Código de prestación duplicado');
      }
      throw e;
    }
  }
}

