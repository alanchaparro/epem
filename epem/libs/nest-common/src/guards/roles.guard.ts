import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredRoles =
      this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [context.getHandler(), context.getClass()]) ?? [];

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const headerRole = request.headers['x-user-role'];
    const headerValue = Array.isArray(headerRole) ? headerRole[0] : headerRole;
    const userRole = (request as any)?.user?.role;

    const resolvedRole = (headerValue ?? userRole)?.toString().toUpperCase();
    if (!resolvedRole) {
      throw new ForbiddenException('Rol de usuario ausente');
    }

    if (!requiredRoles.includes(resolvedRole as Role)) {
      throw new ForbiddenException('No tiene permisos para la operación solicitada');
    }

    return true;
  }
}
