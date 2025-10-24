export declare const ROLES_KEY = "roles";
export type Role = 'ADMIN' | 'SUPERVISOR' | 'DOCTOR' | 'NURSE' | 'STAFF' | 'BILLING';
export declare const Roles: (...roles: Role[]) => import("@nestjs/common").CustomDecorator<string>;
