'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

const schema = z.object({
  patientId: z.string().min(1, 'Paciente requerido'),
  serviceItemId: z.string().min(1, 'Prestacion requerida'),
  insurerId: z.string().optional(),
  requiresAuth: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

type Order = {
  id: string;
  patientId: string;
  serviceItemId: string;
  insurerId?: string | null;
  requiresAuth: boolean;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
  patient?: { id: string; firstName: string; lastName: string };
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const { data, isFetching } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () => apiFetch<Order[]>('/api/orders'),
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { patientId: '', serviceItemId: '', insurerId: '', requiresAuth: false },
  });

  const createMutation = useMutation({
    mutationFn: (payload: FormValues) =>
      apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(payload) }),
    onSuccess: () => {
      toast.success('Orden creada');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      form.reset({ patientId: '', serviceItemId: '', insurerId: '', requiresAuth: false });
    },
    onError: (error: any) => toast.error(error?.message ?? 'Error al crear orden'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/api/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
    onError: (error: any) => toast.error(error?.message ?? 'Error al actualizar estado'),
  });

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <section>
        <h1 className="mb-4 text-2xl font-semibold">Ordenes</h1>
        {isFetching && <p className="text-sm text-slate-400">Cargando ordenes...</p>}
        <table className="w-full table-auto border-collapse overflow-hidden rounded border border-slate-800">
          <thead className="bg-slate-900/60">
            <tr>
              <th className="px-3 py-2 text-left text-sm text-slate-300">Paciente</th>
              <th className="px-3 py-2 text-left text-sm text-slate-300">Prestacion</th>
              <th className="px-3 py-2 text-left text-sm text-slate-300">Aseguradora</th>
              <th className="px-3 py-2 text-left text-sm text-slate-300">Auth</th>
              <th className="px-3 py-2 text-left text-sm text-slate-300">Estado</th>
              <th className="px-3 py-2 text-left text-sm text-slate-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((order) => (
              <tr key={order.id} className="border-t border-slate-800 hover:bg-slate-900/40">
                <td className="px-3 py-2 text-sm">
                  {order.patient ? `${order.patient.lastName}, ${order.patient.firstName}` : order.patientId}
                </td>
                <td className="px-3 py-2 text-sm">
                  <code className="rounded bg-slate-900 px-2 py-1 text-xs">{order.serviceItemId}</code>
                </td>
                <td className="px-3 py-2 text-sm">{order.insurerId ?? '-'}</td>
                <td className="px-3 py-2 text-sm">{order.requiresAuth ? 'Si' : 'No'}</td>
                <td className="px-3 py-2 text-sm">{order.status}</td>
                <td className="px-3 py-2 text-sm space-x-2">
                  <button
                    onClick={() => statusMutation.mutate({ id: order.id, status: 'IN_PROGRESS' })}
                    disabled={order.status === 'IN_PROGRESS' || order.status === 'COMPLETED'}
                    className="rounded border border-slate-700 px-3 py-1 text-xs"
                  >
                    Marcar en curso
                  </button>
                  <button
                    onClick={() => statusMutation.mutate({ id: order.id, status: 'COMPLETED' })}
                    disabled={order.status === 'COMPLETED'}
                    className="rounded bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950"
                  >
                    Completar
                  </button>
                </td>
              </tr>
            ))}
            {(!data || data.length === 0) && !isFetching && (
              <tr>
                <td colSpan={6} className="px-3 py-6 text-center text-sm text-slate-400">
                  Sin ordenes registradas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded border border-slate-800 bg-slate-900/40 p-6">
        <h2 className="mb-4 text-lg font-semibold">Nueva orden</h2>
        <form
          className="grid gap-3 sm:grid-cols-2"
          onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
        >
          <div>
            <label className="text-sm text-slate-300">ID de paciente</label>
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              placeholder="uuid paciente"
              {...form.register('patientId')}
            />
            {form.formState.errors.patientId && (
              <p className="mt-1 text-xs text-red-300">{form.formState.errors.patientId.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-slate-300">Prestacion (codigo)</label>
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              placeholder="LAB01"
              {...form.register('serviceItemId')}
            />
            {form.formState.errors.serviceItemId && (
              <p className="mt-1 text-xs text-red-300">{form.formState.errors.serviceItemId.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-slate-300">Aseguradora (opcional)</label>
            <input
              className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm"
              placeholder="uuid aseguradora"
              {...form.register('insurerId')}
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input type="checkbox" {...form.register('requiresAuth', { valueAsBoolean: true })} /> Requiere autorizacion
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="rounded bg-emerald-500 px-4 py-2 text-emerald-950 disabled:opacity-60"
            >
              {createMutation.isPending ? 'Guardando...' : 'Guardar orden'}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
