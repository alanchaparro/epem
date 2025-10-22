import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

const ROLE_VALUES = ['ADMIN', 'SUPERVISOR', 'DOCTOR', 'NURSE', 'STAFF', 'BILLING'] as const;

export class CreateUserDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsIn(ROLE_VALUES as readonly string[])
  @IsOptional()
  role?: (typeof ROLE_VALUES)[number];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
