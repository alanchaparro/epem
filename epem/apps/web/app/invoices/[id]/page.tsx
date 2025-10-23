'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

type Invoice = {
  id: string;
  patientId: string;
  orderId: string;
  total: string | number;
  status: 'DRAFT' | 'ISSUED';
  issuedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

interface InvoicePageProps {
  params: { id: string };
}

export default function InvoiceDetailPage({ params }: InvoicePageProps) {
  const queryClient = useQueryClient();
  const { data, isFetching } = useQuery<Invoice>({
    queryKey: ['invoice', params.id],
    queryFn: () => apiFetch<Invoice>(`/api/billing/invoices/${params.id}`),
  });

  const issueMutation = useMutation({
    mutationFn: () => apiFetch(`/api/billing/invoices/${params.id}/issue`, { method: 'PATCH' }),
    onSuccess: () => {
      toast.success('Factura emitida');
      queryClient.invalidateQueries({ queryKey: ['invoice', params.id] });
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => toast.error(error?.message ?? 'Error al emitir factura'),
  });

  if (isFetching && !data) {
    return <main className="mx-auto max-w-4xl px-6 py-10">Cargando factura...</main>;
  }

  if (!data) {
    return (
      <main className="mx-auto max-w-4xl px-6 py-10">
        <p className="text-sm text-red-300">Factura no encontrada.</p>
        <Link href="/invoices" className="mt-4 inline-block text-sm text-emerald-300 underline">
          Volver
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Factura {data.id}</h1>
          <p className="text-sm text-slate-400">Orden: {data.orderId}</p>
        </div>
        <Link href="/invoices" className="rounded border border-slate-700 px-3 py-1 text-sm">
          Volver
        </Link>
      </div>

      <section className="space-y-3 rounded border border-slate-800 bg-slate-900/40 p-6 text-sm text-slate-200">
        <p>
          <span className="font-semibold">Paciente:</span> {data.patientId}
        </p>
        <p>
          <span className="font-semibold">Total:</span> ${Number(data.total).toFixed(2)}
        </p>
        <p>
          <span className="font-semibold">Estado:</span> {data.status}
        </p>
        <p>
          <span className="font-semibold">Creada:</span> {new Date(data.createdAt).toLocaleString()}
        </p>
        <p>
          <span className="font-semibold">Emitida:</span>{' '}
          {data.issuedAt ? new Date(data.issuedAt).toLocaleString() : '-'}
        </p>
        <p>
          <span className="font-semibold">Ultima actualizacion:</span>{' '}
          {new Date(data.updatedAt).toLocaleString()}
        </p>
      </section>

      <button
        onClick={() => issueMutation.mutate()}
        disabled={data.status === 'ISSUED' || issueMutation.isPending}
        className="rounded bg-emerald-500 px-4 py-2 text-emerald-950 disabled:opacity-60"
      >
        {data.status === 'ISSUED' ? 'Factura emitida' : issueMutation.isPending ? 'Emitiendo...' : 'Emitir factura'}
      </button>
    </main>
  );
}
