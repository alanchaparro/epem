import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SafeUser, toSafeUser } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const normalizedEmail = dto.email.toLowerCase();
    const passwordHash = await bcrypt.hash(dto.password, 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: dto.role ?? UserRole.STAFF,
          isActive: dto.isActive ?? true,
        },
      });

      return toSafeUser(user);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('El correo ya está registrado.');
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<SafeUser | null> {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    return user ? toSafeUser(user) : null;
  }

  async findById(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return toSafeUser(user);
  }

  async findByEmailWithPassword(email: string) {
    return this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async ensureAdminUser(payload: { email: string; password: string; firstName: string; lastName: string }) {
    const normalizedEmail = payload.email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (existing) {
      if (existing.role !== UserRole.ADMIN || !existing.isActive) {
        const updated = await this.prisma.user.update({
          where: { id: existing.id },
          data: { role: UserRole.ADMIN, isActive: true },
        });
        return toSafeUser(updated);
      }
      return toSafeUser(existing);
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const admin = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: UserRole.ADMIN,
        isActive: true,
      },
    });

    return toSafeUser(admin);
  }
}
