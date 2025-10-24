import { IsDateString, IsEmail, IsOptional, IsString, Length, MaxLength } from 'class-validator';

// DTO de creación de paciente. Validado por class-validator en el controller.

export class CreatePatientDto {
  @IsString()
  @Length(6, 20)
  dni!: string;

  @IsString()
  @MaxLength(80)
  firstName!: string;

  @IsString()
  @MaxLength(80)
  lastName!: string;

  @IsDateString()
  birthDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergencyContact?: string;

  @IsOptional()
  @IsString()
  allergies?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

