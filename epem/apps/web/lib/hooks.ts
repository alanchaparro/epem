import { useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { apiFetch } from './api';
import {
  Order,
  OrderSchema,
  Invoice,
  InvoiceSchema,
  DashboardMetrics,
  DashboardMetricsSchema,
  PatientsResponse,
  PatientsResponseSchema,
  OrderStatus,
  InvoiceStatus,
  ServiceItem,
  ServiceItemSchema,
  CatalogResponse,
  CatalogResponseSchema,
  Insurer,
  InsurerSchema,
  Coverage,
  CoverageSchema,
} from './types';

export function useOrders(status?: OrderStatus) {
  return useQuery<Order[]>({
    queryKey: ['orders', status ?? 'ALL'],
    queryFn: async () => {
      const qs = status ? `?status=${status}` : '';
      const data = await apiFetch<unknown>(`/api/orders${qs}`);
      const arr = z.array(OrderSchema).parse(data);
      return arr;
    },
  });
}

export function useInvoices(status?: InvoiceStatus | 'ALL') {
  return useQuery<Invoice[]>({
    queryKey: ['invoices', status ?? 'ALL'],
    queryFn: async () => {
      const qs = status && status !== 'ALL' ? `?status=${status}` : '';
      const data = await apiFetch<unknown>(`/api/billing/invoices${qs}`);
      const arr = z.array(InvoiceSchema).parse(data);
      return arr;
    },
  });
}

export function useDashboardMetrics() {
  return useQuery<DashboardMetrics>({
    queryKey: ['dashboard-metrics'],
    queryFn: async () => {
      const data = await apiFetch<unknown>('/api/analytics/metrics');
      return DashboardMetricsSchema.parse(data);
    },
  });
}

export function usePatientsList(params: { q?: string; page?: number; take?: number }) {
  const q = params.q ?? '';
  const page = params.page ?? 0;
  const take = params.take ?? 20;
  return useQuery<PatientsResponse>({
    queryKey: ['patients', { q, page, take }],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (q) search.set('q', q);
      search.set('skip', String(page * take));
      search.set('take', String(take));
      const data = await apiFetch<unknown>(`/api/patients?${search.toString()}`);
      return PatientsResponseSchema.parse(data);
    },
  });
}

// Catalog hooks
export function useCatalogList(params: { q?: string; page?: number; take?: number }) {
  const q = params.q ?? '';
  const page = params.page ?? 0;
  const take = params.take ?? 20;
  return useQuery<CatalogResponse>({
    queryKey: ['catalog', { q, page, take }],
    queryFn: async () => {
      const search = new URLSearchParams();
      if (q) search.set('q', q);
      search.set('skip', String(page * take));
      search.set('take', String(take));
      const data = await apiFetch<unknown>(`/api/catalog/items?${search.toString()}`);
      return CatalogResponseSchema.parse(data);
    },
  });
}

export function useServiceItem(id?: string) {
  return useQuery<ServiceItem>({
    queryKey: ['item', id ?? ''],
    enabled: !!id,
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/api/catalog/items/${id}`);
      return ServiceItemSchema.parse(data);
    },
  });
}

// Insurers hooks
export function useInsurers() {
  return useQuery<Insurer[]>({
    queryKey: ['insurers'],
    queryFn: async () => {
      const data = await apiFetch<unknown>('/api/billing/insurers');
      return (Array.isArray(data) ? data : []).map((x) => InsurerSchema.parse(x));
    },
  });
}

export function useInsurer(id?: string) {
  return useQuery<Insurer>({
    queryKey: ['insurer', id ?? ''],
    enabled: !!id,
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/api/billing/insurers/${id}`);
      return InsurerSchema.parse(data);
    },
  });
}

// Coverage hooks
export function useCoverage(insurerId?: string) {
  return useQuery<Coverage[]>({
    queryKey: ['coverage', insurerId ?? ''],
    enabled: !!insurerId,
    queryFn: async () => {
      const data = await apiFetch<unknown>(`/api/billing/coverage?insurerId=${insurerId}`);
      return (Array.isArray(data) ? data : []).map((x) => CoverageSchema.parse(x));
    },
  });
}
