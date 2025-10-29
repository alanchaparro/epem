import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULTS: Record<string, any> = {
  ADMIN: {
    modules: {
      users: { read: true, write: true },
      patients: { read: true, write: true },
      catalog: { read: true, write: true },
      billing: { read: true, write: true },
      orders: { read: true, write: true },
      analytics: { read: true, write: true },
    },
  },
  SUPERVISOR: {
    modules: {
      users: { read: true, write: false },
      patients: { read: true, write: true },
      catalog: { read: true, write: true },
      billing: { read: true, write: false },
      orders: { read: true, write: true },
      analytics: { read: true, write: true },
    },
  },
  DOCTOR: {
    modules: {
      users: { read: false, write: false },
      patients: { read: true, write: true },
      catalog: { read: true, write: false },
      billing: { read: false, write: false },
      orders: { read: true, write: true },
      analytics: { read: true, write: false },
    },
  },
  NURSE: {
    modules: {
      users: { read: false, write: false },
      patients: { read: true, write: true },
      catalog: { read: true, write: false },
      billing: { read: false, write: false },
      orders: { read: true, write: false },
      analytics: { read: false, write: false },
    },
  },
  STAFF: {
    modules: {
      users: { read: false, write: false },
      patients: { read: true, write: false },
      catalog: { read: true, write: false },
      billing: { read: false, write: false },
      orders: { read: true, write: false },
      analytics: { read: false, write: false },
    },
  },
  BILLING: {
    modules: {
      users: { read: false, write: false },
      patients: { read: true, write: false },
      catalog: { read: true, write: false },
      billing: { read: true, write: true },
      orders: { read: true, write: false },
      analytics: { read: true, write: false },
    },
  },
};

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  async getPolicy(role: string) {
    const found = await this.prisma.rolePolicy.findUnique({ where: { role: role as any } });
    if (found) {
      const perms = (found.permissions ?? {}) as any;
      if (perms?.modules) return perms;
      return { modules: perms };
    }
    return DEFAULTS[role] ?? DEFAULTS['STAFF'];
  }

  private roleLabel(role: string) {
    const labels: Record<string, string> = {
      ADMIN: 'Administrador',
      SUPERVISOR: 'Supervisor',
      DOCTOR: 'Medico',
      NURSE: 'Enfermeria',
      STAFF: 'Staff',
      BILLING: 'Facturacion',
    };
    return labels[role] ?? role;
  }

  async list() {
    const [metas, policies] = await Promise.all([
      this.prisma.roleMeta.findMany(),
      this.prisma.rolePolicy.findMany(),
    ]);

    const roles = new Set<string>(Object.keys(DEFAULTS));
    metas.forEach((m) => roles.add(m.role));
    policies.forEach((p) => roles.add(p.role));

    const metaMap = new Map(metas.map((m) => [m.role, m]));
    const policyMap = new Map(policies.map((p) => [p.role, p]));

    const rolesOut: Record<string, any> = {};
    for (const r of Array.from(roles).sort()) {
      const storedPolicy = policyMap.get(r);
      let modules = DEFAULTS[r]?.modules ?? {};
      if (storedPolicy) {
        const perms = (storedPolicy.permissions ?? {}) as any;
        modules = perms?.modules ?? perms ?? modules;
      }
      const displayName = metaMap.get(r)?.displayName ?? this.roleLabel(r) ?? r;
      rolesOut[r] = { displayName, modules };
    }

    const modulesMeta: Record<string, any> = {
      users: { label: 'Usuarios', description: 'Gestion de usuarios y roles' },
      patients: { label: 'Pacientes', description: 'Pacientes y ordenes' },
      catalog: { label: 'Catalogo', description: 'Prestaciones y precios' },
      billing: { label: 'Facturacion', description: 'Coberturas y facturas' },
      orders: { label: 'Ordenes', description: 'Ordenes de servicios' },
      analytics: { label: 'Analitica', description: 'Metricas y paneles' },
    };
    return { roles: rolesOut, modulesMeta };
  }

  async update(role: string, data: any) {
    if (data?.displayName) {
      await this.prisma.roleMeta.upsert({
        where: { role: role as any },
        update: { displayName: data.displayName },
        create: { role: role as any, displayName: data.displayName },
      });
    }
    if (data?.modules) {
      const perms = { modules: data.modules };
      await this.prisma.rolePolicy.upsert({
        where: { role: role as any },
        update: { permissions: perms },
        create: { role: role as any, permissions: perms },
      });
    }
    return { ok: true } as any;
  }

  async create(payload: { role: string; displayName?: string; modules?: any }) {
    const role = (payload.role || '').trim().toUpperCase();
    if (!role) return { ok: false, error: 'role requerido' } as any;
    await this.prisma.roleMeta.upsert({
      where: { role },
      update: { displayName: payload.displayName || role },
      create: { role, displayName: payload.displayName || role },
    });
    const modules = payload.modules || (DEFAULTS[role]?.modules ?? {});
    await this.prisma.rolePolicy.upsert({
      where: { role },
      update: { permissions: { modules } },
      create: { role, permissions: { modules } },
    });
    return { ok: true } as any;
  }

  async remove(role: string) {
    const count = await this.prisma.user.count({ where: { role } });
    if (count > 0) {
      return { ok: false, error: 'Hay usuarios con este rol. No se puede eliminar.' } as any;
    }
    await this.prisma.rolePolicy.deleteMany({ where: { role } });
    await this.prisma.roleMeta.deleteMany({ where: { role } });
    return { ok: true } as any;
  }
}
