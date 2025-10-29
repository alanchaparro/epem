import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../../generated/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SafeUser, toSafeUser } from './entities/user.entity';

/** Servicio de dominio de usuarios (alta, búsqueda y seeding de ADMIN). */
@Injectable()
export class UsersService {
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async create(dto: CreateUserDto): Promise<SafeUser> {
    const normalizedEmail = dto.email.toLowerCase();
    const rounds = this.config.get<string>('BCRYPT_SALT_ROUNDS');
    const cost = rounds ? parseInt(rounds, 10) : 10;
    const passwordHash = await bcrypt.hash(dto.password, isFinite(cost) ? cost : 10);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          passwordHash,
          firstName: dto.firstName,
          lastName: dto.lastName,
          role: (dto.role as any) ?? 'STAFF',
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
      if (existing.role !== 'ADMIN' || !existing.isActive) {
        const updated = await this.prisma.user.update({
          where: { id: existing.id },
          data: { role: 'ADMIN' as any, isActive: true },
        });
        return toSafeUser(updated);
      }
      return toSafeUser(existing);
    }

    const rounds = this.config.get<string>('BCRYPT_SALT_ROUNDS');
    const cost = rounds ? parseInt(rounds, 10) : 10;
    const passwordHash = await bcrypt.hash(payload.password, isFinite(cost) ? cost : 10);
    const admin = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: 'ADMIN' as any,
        isActive: true,
      },
    });

    return toSafeUser(admin);
  }

  async list(params: { q?: string; skip?: number; take?: number; onlyActive?: boolean }) {
    const where: Prisma.UserWhereInput = {};
    if (params.onlyActive) where.isActive = true;
    if (params.q) {
      const q = params.q.toLowerCase();
      where.OR = [
        { email: { contains: q } },
        { firstName: { contains: q } },
        { lastName: { contains: q } },
      ];
    }
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: params.skip ?? 0,
        take: Math.min(params.take ?? 20, 100),
      }),
      this.prisma.user.count({ where }),
    ]);
    return { items: items.map(toSafeUser), total };
  }

  async update(id: string, data: Partial<{ email: string; firstName: string; lastName: string; role: string; isActive: boolean; password: string }>): Promise<SafeUser> {
    const payload: Prisma.UserUpdateInput = {};
    if (typeof data.email === 'string') payload.email = data.email.toLowerCase();
    if (typeof data.firstName === 'string') payload.firstName = data.firstName;
    if (typeof data.lastName === 'string') payload.lastName = data.lastName;
    if (typeof data.role === 'string') payload.role = data.role as any;
    if (typeof data.isActive === 'boolean') payload.isActive = data.isActive;
    if (typeof data.password === 'string' && data.password.length >= 8) {
      const rounds = this.config.get<string>('BCRYPT_SALT_ROUNDS');
      const cost = rounds ? parseInt(rounds, 10) : 10;
      payload.passwordHash = await bcrypt.hash(data.password, isFinite(cost) ? cost : 10);
    }
    const user = await this.prisma.user.update({ where: { id }, data: payload });
    return toSafeUser(user);
  }

  async deactivate(id: string): Promise<SafeUser> {
    const user = await this.prisma.user.update({ where: { id }, data: { isActive: false } });
    return toSafeUser(user);
  }
}

