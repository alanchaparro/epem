import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { UpdatePatientDto } from './dto/update-patient.dto';

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
    return this.prisma.patient.create({ data });
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

    const [items, total] = await this.prisma.$transaction([
      this.prisma.patient.findMany({ where, skip, take, orderBy: { lastName: 'asc' } }),
      this.prisma.patient.count({ where }),
    ]);

    return { items, total, skip, take };
  }

  async findOne(id: string) {
    const item = await this.prisma.patient.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Paciente no encontrado');
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
