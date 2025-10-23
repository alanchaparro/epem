'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

type Authorization = {
  id: string;
  orderId: string;
  patientId: string;
  serviceItemId: string;
  insurerId?: string | null;
  status: 'PENDING' | 'APPROVED' | 'DENIED';
  authCode?: string | null;
  requestedAt: string;
  resolvedAt?: string | null;
};

const statuses = ['ALL', 'PENDING', 'APPROVED', 'DENIED'];

export default function AuthorizationsPage() {
  const [filter, setFilter] = useState('PENDING');
  const queryClient = useQueryClient();

  const authQuery = useQuery<Authorization[]>({
    queryKey: ['authorizations', filter],
    queryFn: () => {
      const query = filter !== 'ALL' ? `?status=${filter}` : '';
      return apiFetch<Authorization[]>(`/api/billing/authorizations${query}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, status, authCode }: { id: string; status: string; authCode?: string }) =>
      apiFetch(`/api/billing/authorizations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status, authCode }),
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['authorizations'] }),
    onError: (error: any) => toast.error(error?.message ?? 'Error al actualizar autorizacion'),
  });

  const data = useMemo(() => authQuery.data ?? [], [authQuery.data]);

  const approve = (id: string) => {
    const authCode = prompt('Codigo de autorizacion (opcional):') ?? undefined;
    updateMutation.mutate({ id, status: 'APPROVED', authCode });
  };

  const deny = (id: string) => {
    updateMutation.mutate({ id, status: 'DENIED' });
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-6 py-10">
      <section className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Autorizaciones</h1>
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
      </section>

      {authQuery.isFetching && <p className="text-sm text-slate-400">Cargando autorizaciones...</p>}

      <table className="w-full table-auto border-collapse overflow-hidden rounded border border-slate-800">
        <thead className="bg-slate-900/60">
          <tr>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Orden</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Paciente</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Prestacion</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Aseguradora</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Estado</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Auth code</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((auth) => (
            <tr key={auth.id} className="border-t border-slate-800 hover:bg-slate-900/40">
              <td className="px-3 py-2 text-sm">{auth.orderId}</td>
              <td className="px-3 py-2 text-sm">{auth.patientId}</td>
              <td className="px-3 py-2 text-sm">{auth.serviceItemId}</td>
              <td className="px-3 py-2 text-sm">{auth.insurerId ?? '-'}</td>
              <td className="px-3 py-2 text-sm">{auth.status}</td>
              <td className="px-3 py-2 text-sm">{auth.authCode ?? '-'}</td>
              <td className="px-3 py-2 text-sm space-x-2">
                <button
                  onClick={() => approve(auth.id)}
                  disabled={auth.status !== 'PENDING'}
                  className="rounded bg-emerald-500 px-3 py-1 text-xs font-semibold text-emerald-950 disabled:opacity-60"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => deny(auth.id)}
                  disabled={auth.status !== 'PENDING'}
                  className="rounded border border-slate-700 px-3 py-1 text-xs"
                >
                  Rechazar
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && !authQuery.isFetching && (
            <tr>
              <td colSpan={7} className="px-3 py-6 text-center text-sm text-slate-400">
                Sin autorizaciones
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </main>
  );
}
