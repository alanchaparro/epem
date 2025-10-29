import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import type { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;
    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = (request.headers as any).authorization ?? (request.headers as any).Authorization;
    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException('Falta encabezado Authorization');
    }

    const [scheme, token] = authHeader.split(' ');
    if (!token || !/^Bearer$/i.test(scheme)) {
      throw new UnauthorizedException('Encabezado Authorization inválido');
    }
    try {
      const payload = this.jwt.verify(token, {
        secret: process.env.JWT_SECRET ?? 'change-me',
      });
      (request as any).user = payload;
      if ((payload as any)?.sub) {
        (request.headers as any)['x-user-id'] = Array.isArray((payload as any).sub)
          ? (payload as any).sub[0]
          : (payload as any).sub;
      }
      if ((payload as any)?.role) {
        (request.headers as any)['x-user-role'] = Array.isArray((payload as any).role)
          ? (payload as any).role[0]
          : (payload as any).role;
      }
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido');
    }
  }
}
