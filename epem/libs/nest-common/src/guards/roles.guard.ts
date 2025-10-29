import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { ROLES_KEY, Role } from '../decorators/roles.decorator';
import crypto from 'crypto';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt?: JwtService) {}

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
    let userRole = (request as any)?.user?.role as string | undefined;

    // If user not populated yet but Authorization is present, try to decode to extract role
    if (!userRole && this.jwt) {
      const authHeader = (request.headers as any).authorization ?? (request.headers as any).Authorization;
      if (authHeader && !Array.isArray(authHeader)) {
        const parts = authHeader.split(' ');
        const token = parts.length === 2 ? parts[1] : parts[0];
        try {
          const payload: any = this.jwt.verify(token, { secret: process.env.JWT_SECRET ?? 'change-me' });
          userRole = payload?.role;
          (request as any).user = payload;
        } catch {}
      }
    }
    if (userRole) {
      const roleUpper = userRole.toString().toUpperCase();
      if (!requiredRoles.includes(roleUpper as Role)) {
        throw new ForbiddenException('No tiene permisos para la operación solicitada');
      }
      return true;
    }

    // Fallback: permitir encabezado x-user-role solo si viene firmado desde el gateway
    const shared = process.env.GATEWAY_SHARED_SECRET;
    const trustedIpsRaw = process.env.TRUSTED_PROXY_IPS;
    const trustedIps = trustedIpsRaw ? trustedIpsRaw.split(',').map(s => s.trim()).filter(Boolean) : [];
    const headerRole = request.headers['x-user-role'];
    const headerUserId = request.headers['x-user-id'];
    const headerTs = request.headers['x-gw-ts'];
    const headerSig = request.headers['x-gw-sig'];
    const roleVal = Array.isArray(headerRole) ? headerRole[0] : headerRole;
    const userIdVal = Array.isArray(headerUserId) ? headerUserId[0] : headerUserId;
    const tsVal = Array.isArray(headerTs) ? headerTs[0] : headerTs;
    const sigVal = Array.isArray(headerSig) ? headerSig[0] : headerSig;

    const now = Date.now();
    const maxSkewSec = parseInt(process.env.GATEWAY_SIGNATURE_MAX_SKEW_SEC ?? '300', 10);
    const tsNum = tsVal ? Number(tsVal) : 0;
    const withinWindow = tsNum > 0 && Math.abs(now - tsNum) <= maxSkewSec * 1000;

    // Trusted by signature
    if (shared && roleVal && userIdVal && tsVal && sigVal && withinWindow) {
      const base = `${request.method}:${request.originalUrl || request.url}:${userIdVal}:${roleVal}:${tsVal}`;
      const expected = crypto.createHmac('sha256', shared).update(base).digest('hex');
      const ok = expected.length === String(sigVal).length && crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(String(sigVal)));
      if (ok) {
        const roleUpper = roleVal.toString().toUpperCase();
        if (!requiredRoles.includes(roleUpper as Role)) {
          throw new ForbiddenException('No tiene permisos para la operación solicitada');
        }
        return true;
      }
    }

    // Trusted by source IP allowlist (optional)
    if (trustedIps.length > 0 && roleVal) {
      const xff = (request.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim();
      const remote = (request.socket?.remoteAddress || (request as any).ip || '').toString();
      const candidate = xff || remote;
      if (candidate && trustedIps.includes(candidate)) {
        const roleUpper = roleVal.toString().toUpperCase();
        if (!requiredRoles.includes(roleUpper as Role)) {
          throw new ForbiddenException('No tiene permisos para la operación solicitada');
        }
        return true;
      }
    }

    throw new ForbiddenException('Rol de usuario ausente o no confiable');
  }
}
