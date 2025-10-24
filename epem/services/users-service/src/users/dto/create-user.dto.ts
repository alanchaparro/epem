import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

// Valores de rol permitidos. Usamos una unión de strings en vez del enum
// de Prisma en runtime para evitar problemas de importación.
const ROLE_VALUES = ['ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE', 'STAFF', 'BILLING'] as const;

/**
 * DTO para alta de usuarios.
 * Se valida con class-validator en el Users Service antes de persistir.
 */
export class CreateUserDto {
  // Email corporativo del usuario.
  @IsEmail()
  email!: string;

  // Contraseña mínima de 8 caracteres (se almacena en hash server-side).
  @IsString()
  @MinLength(8)
  password!: string;

  // Nombre y apellido para vistas de perfil.
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  // Rol del sistema (RBAC básico).
  @IsIn(ROLE_VALUES as readonly string[])
  @IsOptional()
  role?: (typeof ROLE_VALUES)[number];

  // Flag de activación del usuario.
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

