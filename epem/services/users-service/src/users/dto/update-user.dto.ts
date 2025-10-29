import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const ROLE_VALUES = ['ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE', 'STAFF', 'BILLING'] as const;

/** DTO para actualizar usuarios (parcial). */
export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsIn(ROLE_VALUES as readonly string[])
  @IsOptional()
  role?: (typeof ROLE_VALUES)[number];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  // Permite resetear la contraseña desde administración
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;
}

