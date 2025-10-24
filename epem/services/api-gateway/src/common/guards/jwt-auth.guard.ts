import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { IS_PUBLIC_KEY } from '@epem/nest-common';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly jwt: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization ?? request.headers.Authorization;
    if (!authHeader || Array.isArray(authHeader)) {
      throw new UnauthorizedException('Falta encabezado Authorization');
    }

    const [, token] = authHeader.split(' ');
    if (!token) {
      throw new UnauthorizedException('Token Bearer inválido');
    }
    try {
      const payload = this.jwt.verify(token, {
        secret: process.env.JWT_SECRET ?? 'change-me',
      });
      (request as any).user = payload;
      if (payload?.sub) {
        request.headers['x-user-id'] = Array.isArray(payload.sub) ? payload.sub[0] : payload.sub;
      }
      if (payload?.role) {
        request.headers['x-user-role'] = Array.isArray(payload.role) ? payload.role[0] : payload.role;
      }
      return true;
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}

