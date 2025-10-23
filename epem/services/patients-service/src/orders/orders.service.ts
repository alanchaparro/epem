import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderStatus } from '../../generated/client';

const BILLING_BASE_URL = process.env.BILLING_SERVICE_URL ?? 'http://localhost:3040';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService, private readonly http: HttpService) {}

  async create(dto: CreateOrderDto) {
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId } });
    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    const requiresAuth = dto.requiresAuth ?? false;
    const initialStatus = requiresAuth ? OrderStatus.PENDING : OrderStatus.IN_PROGRESS;

    const order = await this.prisma.order.create({
      data: {
        patientId: dto.patientId,
        serviceItemId: dto.serviceItemId,
        insurerId: dto.insurerId,
        requiresAuth,
        status: initialStatus,
      },
    });

    if (requiresAuth) {
      const payload = {
        orderId: order.id,
        patientId: dto.patientId,
        serviceItemId: dto.serviceItemId,
        insurerId: dto.insurerId,
      };
      try {
        await firstValueFrom(this.http.post(`${BILLING_BASE_URL}/authorizations`, payload));
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(
          'No fue posible crear autorizacion en billing-service',
          error?.response?.data ?? error?.message ?? error,
        );
      }
    }

    return order;
  }

  async findAll(status?: OrderStatus) {
    return this.prisma.order.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: { patient: { select: { id: true, firstName: true, lastName: true } } },
    });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }

    const nextStatus = dto.status;
    if (order.status === OrderStatus.COMPLETED && nextStatus !== OrderStatus.COMPLETED) {
      throw new BadRequestException('No se puede modificar una orden completada');
    }

    return this.prisma.order.update({
      where: { id },
      data: {
        status: nextStatus,
      },
    });
  }
}
