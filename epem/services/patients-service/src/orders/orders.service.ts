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
    const patient = await this.prisma.patient.findUnique({ where: { id: dto.patientId }, select: { id: true } });
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
      select: {
        id: true,
        patientId: true,
        serviceItemId: true,
        insurerId: true,
        requiresAuth: true,
        status: true,
        createdAt: true,
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
        await firstValueFrom(
          this.http.post(`${BILLING_BASE_URL}/authorizations`, payload, {
            headers: { 'x-user-role': 'BILLING' },
          }),
        );
      } catch (error: any) {
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
      select: {
        id: true,
        patientId: true,
        serviceItemId: true,
        insurerId: true,
        requiresAuth: true,
        status: true,
        createdAt: true,
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        patientId: true,
        serviceItemId: true,
        insurerId: true,
        requiresAuth: true,
        status: true,
        createdAt: true,
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    if (!order) {
      throw new NotFoundException('Orden no encontrada');
    }
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto) {
    const result = await this.prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id }, select: { id: true, status: true } });
      if (!current) {
        throw new NotFoundException('Orden no encontrada');
      }

      const nextStatus = dto.status;
      if (current.status === OrderStatus.COMPLETED && nextStatus !== OrderStatus.COMPLETED) {
        throw new BadRequestException('No se puede modificar una orden completada');
      }

      return tx.order.update({
        where: { id },
        data: { status: nextStatus },
        select: {
          id: true,
          patientId: true,
          serviceItemId: true,
          insurerId: true,
          requiresAuth: true,
          status: true,
          createdAt: true,
        },
      });
    });
    return result;
  }
}

