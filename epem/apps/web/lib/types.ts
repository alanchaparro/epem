import { z } from 'zod';

export const OrderStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const PatientSchema = z.object({
  id: z.string(),
  dni: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  birthDate: z.string().optional(),
});
export type Patient = z.infer<typeof PatientSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  serviceItemId: z.string(),
  insurerId: z.string().nullable().optional(),
  requiresAuth: z.boolean(),
  status: OrderStatusSchema,
  createdAt: z.string(),
  patient: PatientSchema.pick({ id: true, firstName: true, lastName: true }).optional(),
});
export type Order = z.infer<typeof OrderSchema>;

export const InvoiceStatusSchema = z.enum(['DRAFT', 'ISSUED']);
export type InvoiceStatus = z.infer<typeof InvoiceStatusSchema>;

export const InvoiceSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  orderId: z.string(),
  total: z.union([z.string(), z.number()]),
  status: InvoiceStatusSchema,
  issuedAt: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

export const PatientsResponseSchema = z.object({
  items: z.array(
    PatientSchema.pick({ id: true, dni: true, firstName: true, lastName: true, birthDate: true }).transform((p) => ({
      ...p,
      dni: p.dni ?? '',
      birthDate: p.birthDate ?? '',
    }))
  ),
  total: z.number(),
});
export type PatientsResponse = z.infer<typeof PatientsResponseSchema>;

export const DashboardMetricsSchema = z.object({
  patients: z.object({
    patients: z.object({ total: z.number().optional() }).partial().optional(),
    orders: z.object({
      total: z.number().optional(),
      byStatus: z.record(z.string(), z.number()).optional(),
    }).partial().optional(),
  }),
  catalog: z.object({
    serviceItems: z
      .object({ total: z.number().optional(), active: z.number().optional(), inactive: z.number().optional() })
      .partial()
      .optional(),
  }),
  billing: z.object({
    insurers: z.object({ total: z.number().optional() }).partial().optional(),
    coverages: z.object({ total: z.number().optional() }).partial().optional(),
    authorizations: z
      .object({ total: z.number().optional(), byStatus: z.record(z.string(), z.number()).optional() })
      .partial()
      .optional(),
    invoices: z.object({ total: z.number().optional(), byStatus: z.record(z.string(), z.number()).optional() }).partial().optional(),
  }),
  users: z.object({ users: z.object({ total: z.number().optional(), byRole: z.record(z.string(), z.number()).optional() }).partial().optional() }),
});
export type DashboardMetrics = z.infer<typeof DashboardMetricsSchema>;

// Catalog / Service Items
export const ServiceItemSchema = z.object({
  id: z.string(),
  code: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  basePrice: z.union([z.string(), z.number()]),
  active: z.boolean(),
  createdAt: z.string().optional(),
});
export type ServiceItem = z.infer<typeof ServiceItemSchema>;

export const CatalogResponseSchema = z.object({
  items: z.array(ServiceItemSchema.pick({ id: true, code: true, name: true, basePrice: true, active: true })),
  total: z.number(),
});
export type CatalogResponse = z.infer<typeof CatalogResponseSchema>;

// Billing / Insurers
export const InsurerSchema = z.object({
  id: z.string(),
  name: z.string(),
  planCode: z.string(),
  active: z.boolean(),
  createdAt: z.string().optional(),
});
export type Insurer = z.infer<typeof InsurerSchema>;

// Billing / Coverage
export const CoverageSchema = z.object({
  id: z.string(),
  insurerId: z.string(),
  serviceItemId: z.string(),
  copay: z.union([z.string(), z.number()]),
  requiresAuth: z.boolean(),
});
export type Coverage = z.infer<typeof CoverageSchema>;
