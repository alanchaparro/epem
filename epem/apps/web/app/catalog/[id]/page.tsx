"use client";

import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

const schema = z.object({
  code: z.string().min(2).max(32),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional().or(z.literal('')),
  basePrice: z.coerce.number().min(0),
  active: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>() as any;
  const { data, isFetching } = useQuery({ queryKey: ['item', id], queryFn: () => apiFetch(`/api/catalog/items/${id}`), enabled: !!id });
  const form = useForm<FormValues>({ resolver: zodResolver(schema), values: data ? {
    code: data.code ?? '', name: data.name ?? '', description: data.description ?? '', basePrice: Number(data.basePrice ?? 0), active: data.active ?? true
  } : undefined });

  const mutation = useMutation({
    mutationFn: (payload: FormValues) => apiFetch(`/api/catalog/items/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    onSuccess: () => toast.success('Prestación actualizada'),
    onError: (e: any) => toast.error(e?.message ?? 'Error al guardar'),
  });

  if (!data || isFetching) return <main className="p-6">Cargando…</main>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{data.name} ({data.code})</h1>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm">Código<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('code')} /></label>
        <label className="text-sm">Nombre<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('name')} /></label>
        <label className="text-sm sm:col-span-2">Descripción<textarea className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('description')} /></label>
        <label className="text-sm">Precio base<input type="number" step="0.01" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('basePrice')} /></label>
        <label className="text-sm flex items-center gap-2"><input type="checkbox" {...form.register('active')} /> Activo</label>
        <div className="sm:col-span-2 mt-2">
          <button disabled={mutation.isPending} className="rounded bg-emerald-500 px-4 py-2 text-emerald-950">{mutation.isPending ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </form>
    </main>
  );
}

