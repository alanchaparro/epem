import { IsEmail, IsString, MinLength } from 'class-validator';

// DTO de login para /api/auth/login

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}

