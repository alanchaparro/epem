import { PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';

// DTO de actualización parcial de ítems
export class UpdateItemDto extends PartialType(CreateItemDto) {}

