'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';
import { useInvoices } from '@/lib/hooks';
import { Invoice } from '@/lib/types';

const statuses = ['ALL', 'DRAFT', 'ISSUED'];

const schema = z.object({
  orderId: z.string().min(1, 'ID de orden requerido'),
});

export default function InvoicesPage() {
  const [filter, setFilter] = useState('ALL');
  const queryClient = useQueryClient();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { orderId: '' },
  });

  const invoicesQuery = useInvoices(filter as any);

  const invoices = useMemo(() => invoicesQuery.data ?? [], [invoicesQuery.data]);

  const createMutation = useMutation({
    mutationFn: (payload: z.infer<typeof schema>) =>
      apiFetch('/api/billing/invoices', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      toast.success('Factura generada');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
      form.reset({ orderId: '' });
    },
    onError: (error: any) => toast.error(error?.message ?? 'Error al generar factura'),
  });

  const issueMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/billing/invoices/${id}/issue`, { method: 'PATCH' }),
    onSuccess: () => {
      toast.success('Factura emitida');
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => toast.error(error?.message ?? 'Error al emitir factura'),
  });

  const exportDrafts = () => {
    const drafts = invoices.filter((invoice) => invoice.status === 'DRAFT');
    if (drafts.length === 0) {
      toast.error('No hay facturas en estado DRAFT para exportar');
      return;
    }
    const header = ['invoiceId', 'orderId', 'patientId', 'total', 'createdAt'];
    const rows = drafts.map((invoice) => [
      invoice.id,
      invoice.orderId,
      invoice.patientId,
      Number(invoice.total).toFixed(2),
      new Date(invoice.createdAt).toISOString(),
    ]);
    const csv = [header, ...rows].map((r) => r.map((col) => `"${String(col).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoices-draft-${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Facturas</h1>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
          >
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'Todas' : status}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={exportDrafts}
            className="rounded border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800"
          >
            Exportar DRAFT en CSV
          </button>
        </div>
      </section>

      {invoicesQuery.isFetching && <p className="text-sm text-slate-400">Cargando facturas...</p>}

      <table className="w-full table-auto border-collapse overflow-hidden rounded border border-slate-800">
        <thead className="bg-slate-900/60">
          <tr>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Factura</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Orden</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Paciente</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Total</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Estado</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Emitida</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {invoices.map((invoice) => (
            <tr key={invoice.id} className="border-t border-slate-800 hover:bg-slate-900/40">
              <td className="px-3 py-2 text-sm">
                <Link href={`/invoices/${invoice.id}`} className="text-emerald-300 underline">
                  {invoice.id.slice(0, 8)}...
                </Link>
              </td>
              <td className="px-3 py-2 text-sm">{invoice.orderId}</td>
              <td className="px-3 py-2 text-sm">{invoice.patientId}</td>
              <td className="px-3 py-2 text-sm">${Number(invoice.total).toFixed(2)}</td>
              <td className="px-3 py-2 text-sm">{invoice.status}</td>
              <td className="px-3 py-2 text-sm">
                {invoice.issuedAt ? new Date(invoice.issuedAt).toLocaleString() : '-'}
              </td>
              <td className="px-3 py-2 text-sm space-x-2">
                <button
                  onClick={() => issueMutation.mutate(invoice.id)}
                  disabled={invoice.status === 'ISSUED'}
                  className="rounded bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950 disabled:opacity-60"
                >
                  Emitir
                </button>
              </td>
            </tr>
          ))}
          {invoices.length === 0 && !invoicesQuery.isFetching && (
            <tr>
              <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-400">
                Sin facturas registradas
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <section className="rounded border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="mb-4 text-lg font-semibold">Generar factura desde orden completada</h2>
        <form
          className="flex flex-col gap-4 sm:flex-row"
          onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
        >
          <div className="flex-1">
            <label className="text-sm text-slate-300">ID de orden</label>
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              placeholder="uuid de orden"
              {...form.register('orderId')}
            />
            {form.formState.errors.orderId && (
              <p className="mt-1 text-xs text-red-300">{form.formState.errors.orderId.message}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded bg-emerald-500 px-4 py-2 text-emerald-950 disabled:opacity-60"
          >
            {createMutation.isPending ? 'Generando...' : 'Generar factura'}
          </button>
        </form>
      </section>
    </main>
  );
}
