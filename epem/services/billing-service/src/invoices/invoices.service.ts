import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Prisma, InvoiceStatus } from '../../generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

const PATIENTS_BASE_URL = process.env.PATIENTS_SERVICE_URL ?? 'http://localhost:3010';
const CATALOG_BASE_URL = process.env.CATALOG_SERVICE_URL ?? 'http://localhost:3030';

@Injectable()
export class InvoicesService {
  constructor(private readonly prisma: PrismaService, private readonly http: HttpService) {}

  async findAll(status?: InvoiceStatus) {
    return this.prisma.invoice.findMany({
      where: status ? { status } : undefined,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }
    return invoice;
  }

  async create(dto: CreateInvoiceDto) {
    const order = await this.fetchOrder(dto.orderId);
    if (!order) {
      throw new BadRequestException('Orden no valida');
    }
    if ((order.status ?? '').toUpperCase() !== 'COMPLETED') {
      throw new BadRequestException('La orden debe estar COMPLETED para generar factura');
    }

    const basePrice = await this.fetchServiceItemPrice(order.serviceItemId);
    const total = await this.calculateTotal(order.insurerId, order.serviceItemId, basePrice);

    try {
      const invoice = await this.prisma.invoice.create({
        data: {
          patientId: order.patientId,
          orderId: dto.orderId,
          total,
          status: InvoiceStatus.DRAFT,
        },
      });
      return invoice;
    } catch (error: any) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new BadRequestException('La orden ya tiene una factura generada');
      }
      throw error;
    }
  }

  async issue(id: string) {
    const invoice = await this.prisma.invoice.findUnique({ where: { id } });
    if (!invoice) {
      throw new NotFoundException('Factura no encontrada');
    }
    if (invoice.status === InvoiceStatus.ISSUED) {
      return invoice;
    }
    return this.prisma.invoice.update({
      where: { id },
      data: {
        status: InvoiceStatus.ISSUED,
        issuedAt: new Date(),
      },
    });
  }

  private async fetchOrder(orderId: string) {
    try {
      const { data } = await firstValueFrom(
        this.http.get(`${PATIENTS_BASE_URL}/orders/${orderId}`, {
          headers: { 'x-user-role': 'BILLING' },
        }),
      );
      return data;
    } catch (error: any) {
      // eslint-disable-next-line no-console
      console.error(
        'No se pudo obtener la orden desde patients-service',
        error?.response?.data ?? error?.message ?? error,
      );
      return null;
    }
  }

  private async fetchServiceItemPrice(serviceItemId: string) {
    const parseBasePrice = (raw: any) => {
      if (raw?.basePrice === undefined) {
        throw new Error('Prestacion sin precio base');
      }
      return new Prisma.Decimal(raw.basePrice);
    };

    try {
      const { data } = await firstValueFrom(
        this.http.get(`${CATALOG_BASE_URL}/catalog/items/${serviceItemId}`, {
          headers: { 'x-user-role': 'BILLING' },
        }),
      );
      return parseBasePrice(data);
    } catch (error: any) {
      const status = error?.response?.status;
      try {
        if (status === 404) {
          const response = await firstValueFrom(
            this.http.get(`${CATALOG_BASE_URL}/catalog/items`, {
              params: { q: serviceItemId, take: 1 },
              headers: { 'x-user-role': 'BILLING' },
            }),
          );
          const items = Array.isArray(response.data?.items) ? response.data.items : [];
          const match =
            items.find((item: any) => item?.id === serviceItemId || item?.code === serviceItemId) ?? items[0];
          if (match) {
            return parseBasePrice(match);
          }
        }
      } catch (fallbackError: any) {
        // eslint-disable-next-line no-console
        console.error(
          'Fallback de busqueda de prestacion fallo',
          fallbackError?.response?.data ?? fallbackError?.message ?? fallbackError,
        );
      }

      // eslint-disable-next-line no-console
      console.error(
        'No se pudo obtener la prestacion desde catalog-service',
        error?.response?.data ?? error?.message ?? error,
      );
      throw new BadRequestException('Prestacion no valida');
    }
  }

  private async calculateTotal(insurerId: string | undefined, serviceItemId: string, basePrice: Prisma.Decimal) {
    let total = basePrice;
    if (insurerId) {
      const coverage = await this.prisma.coverage.findFirst({ where: { insurerId, serviceItemId } });
      if (coverage) {
        total = total.minus(coverage.copay);
        if (total.lessThan(0)) {
          total = new Prisma.Decimal(0);
        }
      }
    }
    return total;
  }
}

