import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

export type Role =
  | 'ADMIN'
  | 'SUPERVISOR'
  | 'DOCTOR'
  | 'NURSE'
  | 'STAFF'
  | 'BILLING';

export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
