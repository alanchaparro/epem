import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SafeUser, toSafeUser } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

type LoginPayload = {
  accessToken: string;
  user: SafeUser;
  refreshToken?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<SafeUser> {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    const matches = await bcrypt.compare(password, user.passwordHash);

    if (!matches) {
      throw new UnauthorizedException('Credenciales inválidas.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('El usuario está inactivo.');
    }

    return toSafeUser(user);
  }

  async login(email: string, password: string): Promise<LoginPayload> {
    const user = await this.validateUser(email, password);
    const payload = { sub: user.id, email: user.email, role: user.role };

    const expiresIn = this.configService.get<string>('ACCESS_TOKEN_TTL', '900');
    const accessToken = await this.jwtService.signAsync(payload, { expiresIn: `${expiresIn}s` });

    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'changeme-refresh');
    const refreshTtl = this.configService.get<string>('REFRESH_TOKEN_TTL', '604800');
    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: refreshSecret,
      expiresIn: `${refreshTtl}s`,
    });

    return { accessToken, refreshToken, user };
  }

  async refresh(refreshToken: string): Promise<LoginPayload> {
    const refreshSecret = this.configService.get<string>('JWT_REFRESH_SECRET', 'changeme-refresh');
    let payload: any;
    try {
      payload = await this.jwtService.verifyAsync(refreshToken, { secret: refreshSecret });
    } catch {
      throw new UnauthorizedException('Refresh token inválido.');
    }

    const user = await this.usersService.findById(payload.sub);
    const accessTtl = this.configService.get<string>('ACCESS_TOKEN_TTL', '900');
    const accessToken = await this.jwtService.signAsync({ sub: user.id, email: user.email, role: user.role }, {
      expiresIn: `${accessTtl}s`,
    });

    const rotate = true;
    let newRefresh: string | undefined = undefined;
    if (rotate) {
      newRefresh = await this.jwtService.signAsync({ sub: user.id, email: user.email, role: user.role }, {
        secret: refreshSecret,
        expiresIn: `${this.configService.get<string>('REFRESH_TOKEN_TTL', '604800')}s`,
      });
    }

    return { accessToken, refreshToken: newRefresh ?? undefined, user };
  }
}
