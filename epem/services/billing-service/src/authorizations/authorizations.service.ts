import { Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAuthorizationDto } from './dto/create-authorization.dto';
import { UpdateAuthorizationDto } from './dto/update-authorization.dto';
import { AuthorizationStatus } from '../../generated/client';

const PATIENTS_BASE_URL = process.env.PATIENTS_SERVICE_URL ?? 'http://localhost:3010';

@Injectable()
export class AuthorizationsService {
  constructor(private readonly prisma: PrismaService, private readonly http: HttpService) {}

  async findAll(status?: AuthorizationStatus) {
    return this.prisma.authorization.findMany({
      where: status ? { status } : undefined,
      orderBy: { requestedAt: 'desc' },
    });
  }

  async create(dto: CreateAuthorizationDto) {
    return this.prisma.authorization.create({
      data: {
        orderId: dto.orderId,
        patientId: dto.patientId,
        serviceItemId: dto.serviceItemId,
        insurerId: dto.insurerId,
        status: AuthorizationStatus.PENDING,
      },
    });
  }

  async update(id: string, dto: UpdateAuthorizationDto) {
    const authorization = await this.prisma.authorization.findUnique({ where: { id } });
    if (!authorization) {
      throw new NotFoundException('Autorizacion no encontrada');
    }

    const nextStatus = dto.status ?? authorization.status;
    const update = await this.prisma.authorization.update({
      where: { id },
      data: {
        status: nextStatus,
        authCode: dto.authCode ?? authorization.authCode,
        resolvedAt: nextStatus !== AuthorizationStatus.PENDING ? new Date() : authorization.resolvedAt,
      },
    });

    if (nextStatus === AuthorizationStatus.APPROVED) {
      await this.notifyOrder(update.orderId, AuthorizationStatus.APPROVED);
    } else if (nextStatus === AuthorizationStatus.DENIED) {
      await this.notifyOrder(update.orderId, AuthorizationStatus.DENIED);
    }

    return update;
  }

  private async notifyOrder(orderId: string, status: AuthorizationStatus) {
    const targetStatus = status === AuthorizationStatus.APPROVED ? 'IN_PROGRESS' : 'PENDING';
    await firstValueFrom(
      this.http.patch(
        `${PATIENTS_BASE_URL}/orders/${orderId}/status`,
        {
          status: targetStatus,
        },
        {
          headers: { 'x-user-role': 'BILLING', 'x-forwarded-for': '127.0.0.1' },
        },
      ),
    );
  }
}

