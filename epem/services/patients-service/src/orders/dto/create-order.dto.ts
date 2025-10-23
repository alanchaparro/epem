import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateOrderDto {
  @IsString()
  @MinLength(1)
  patientId!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(64)
  serviceItemId!: string;

  @IsOptional()
  @IsString()
  insurerId?: string;

  @IsOptional()
  @IsBoolean()
  requiresAuth?: boolean;
}
