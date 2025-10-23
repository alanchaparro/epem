import { IsOptional, IsString } from 'class-validator';

export class CreateAuthorizationDto {
  @IsString()
  orderId!: string;

  @IsString()
  patientId!: string;

  @IsString()
  serviceItemId!: string;

  @IsOptional()
  @IsString()
  insurerId?: string;
}
