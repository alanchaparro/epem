import { PartialType } from '@nestjs/mapped-types';
import { CreatePatientDto } from './create-patient.dto';

// DTO de actualización parcial (PATCH) heredando validaciones del DTO de creación.

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}

