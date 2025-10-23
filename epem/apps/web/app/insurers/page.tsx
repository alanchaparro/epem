'use client';

import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

const schema = z.object({
  name: z.string().min(2, 'Nombre requerido').max(120),
  planCode: z.string().min(2, 'Plan requerido').max(50),
  active: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;
type Insurer = { id: string; name: string; planCode: string; active: boolean; createdAt: string };

export default function InsurersPage() {
  const queryClient = useQueryClient();
  const { data, isFetching } = useQuery<Insurer[]>({
    queryKey: ['insurers'],
    queryFn: () => apiFetch<Insurer[]>('/api/billing/insurers'),
  });

  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', planCode: '', active: true } });

  const createMutation = useMutation({
    mutationFn: (payload: FormValues) => apiFetch('/api/billing/insurers', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      toast.success('Aseguradora creada');
      queryClient.invalidateQueries({ queryKey: ['insurers'] });
      form.reset({ name: '', planCode: '', active: true });
    },
    onError: (e: any) => toast.error(e?.message ?? 'Error al crear aseguradora'),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      apiFetch(`/api/billing/insurers/${id}`, { method: 'PATCH', body: JSON.stringify({ active }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['insurers'] }),
    onError: (e: any) => toast.error(e?.message ?? 'Error al actualizar aseguradora'),
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
      <section>
        <h1 className="text-2xl font-semibold mb-4">Aseguradoras</h1>
        <p className="text-sm text-slate-400 mb-4">Gestioná aseguradoras y accedé a la carga de coberturas.</p>
        {isFetching && <p className="text-sm text-slate-400">Cargando…</p>}
        <table className="w-full table-auto border-collapse overflow-hidden rounded border border-slate-800">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="px-3 py-2 text-left text-sm text-slate-300">Nombre</th>
              <th className="px-3 py-2 text-left text-sm text-slate-300">Plan</th>
              <th className="px-3 py-2 text-left text-sm text-slate-300">Estado</th>
              <th className="px-3 py-2 text-left text-sm text-slate-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((insurer) => (
              <tr key={insurer.id} className="border-t border-slate-800 hover:bg-slate-900/40">
                <td className="px-3 py-2 text-sm">{insurer.name}</td>
                <td className="px-3 py-2 text-sm">
                  <code className="rounded bg-slate-900 px-2 py-1 text-xs">{insurer.planCode}</code>
                </td>
                <td className="px-3 py-2 text-sm">{insurer.active ? 'Activa' : 'Inactiva'}</td>
                <td className="px-3 py-2 text-sm space-x-2">
                  <button
                    onClick={() => toggleMutation.mutate({ id: insurer.id, active: !insurer.active })}
                    className="rounded border border-slate-700 px-3 py-1 text-xs"
                  >
                    {insurer.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <Link href={`/insurers/${insurer.id}/coverage`} className="rounded bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950">
                    Coberturas
                  </Link>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && !isFetching && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-400">
                  Sin aseguradoras cargadas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="text-lg font-semibold mb-4">Nueva aseguradora</h2>
        <form className="space-y-4" onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-sm text-slate-300">Nombre</label>
              <input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm" placeholder="Aseguradora" {...form.register('name')} />
              {form.formState.errors.name && <p className="text-xs text-red-300 mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm text-slate-300">Código de plan</label>
              <input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm" placeholder="PLAN-XXX" {...form.register('planCode')} />
              {form.formState.errors.planCode && <p className="text-xs text-red-300 mt-1">{form.formState.errors.planCode.message}</p>}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" defaultChecked {...form.register('active')} /> Activa
          </label>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="rounded bg-emerald-500 px-4 py-2 text-emerald-950"
          >
            {createMutation.isPending ? 'Guardando…' : 'Guardar aseguradora'}
          </button>
        </form>
      </section>
    </main>
  );
}
