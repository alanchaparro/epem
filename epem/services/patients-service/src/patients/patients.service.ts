import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

/** Servicio de dominio para Pacientes (CRUD + busqueda paginada). */
@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePatientDto) {
    const data: Prisma.PatientCreateInput = {
      dni: dto.dni,
      firstName: dto.firstName,
      lastName: dto.lastName,
      birthDate: new Date(dto.birthDate),
      phone: dto.phone,
      email: dto.email,
      address: dto.address,
      emergencyContact: dto.emergencyContact,
      allergies: dto.allergies,
      notes: dto.notes,
    };
    try {
      return await this.prisma.patient.create({ data });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        // DNI unico duplicado
        throw new ConflictException('Paciente ya existe (DNI duplicado)');
      }
      throw error;
    }
  }

  async findAll(params: { q?: string; skip?: number; take?: number }) {
    const { q, skip = 0, take = 20 } = params;
    const where: Prisma.PatientWhereInput | undefined = q
      ? {
          OR: [
            { dni: { contains: q } },
            { lastName: { contains: q } },
            { firstName: { contains: q } },
          ],
        }
      : undefined;

    try {
      const takeClamped = Math.max(0, Math.min(100, take ?? 20));
      const skipClamped = Math.max(0, skip ?? 0);
      // Consultas separadas para evitar issues de transacciones en algunos setups de MySQL/MariaDB
      const items = await this.prisma.patient.findMany({
        where,
        skip: skipClamped,
        take: takeClamped,
        orderBy: { id: 'asc' },
      });
      const total = await this.prisma.patient.count({ where });
      return { items, total, skip: skipClamped, take: takeClamped };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error en PatientsService.findAll', error);
      throw error;
    }
  }

  async findOne(id: string) {
    const item = await this.prisma.patient.findUnique({ where: { id } });
    if (!item) {
      throw new NotFoundException('Paciente no encontrado');
    }
    return item;
  }

  async update(id: string, dto: UpdatePatientDto) {
    await this.findOne(id);
    return this.prisma.patient.update({
      where: { id },
      data: {
        ...dto,
        birthDate: dto.birthDate ? new Date(dto.birthDate) : undefined,
      },
    });
  }
}

