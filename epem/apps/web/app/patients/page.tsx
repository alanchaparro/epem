'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

type Patient = { id: string; dni: string; firstName: string; lastName: string; birthDate: string };
type PatientsResponse = { items: Patient[]; total: number };

const PAGE_SIZE = 20;

export default function PatientsListPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);

  const { data, isFetching } = useQuery<PatientsResponse>({
    queryKey: ['patients', { q, page }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      params.set('skip', String(page * PAGE_SIZE));
      params.set('take', String(PAGE_SIZE));
      try {
        return await apiFetch<PatientsResponse>(`/api/patients?${params.toString()}`);
      } catch (e: any) {
        toast.error(e?.message ?? 'Error al cargar pacientes');
        throw e;
      }
    },
  });

  const items: Patient[] = data?.items ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pacientes</h1>
        <Link href="/patients/new" className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950">Nuevo paciente</Link>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <input value={q} onChange={(event: any) => setQ(event.target?.value ?? '')} placeholder="Buscar por DNI o Apellido" className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm" />
        <button onClick={() => setPage(0)} className="rounded bg-slate-700 px-4 py-2 text-sm">Buscar</button>
      </div>

      {isFetching && <p>Cargando…</p>}

      <table className="w-full table-auto border-collapse overflow-hidden rounded border border-slate-800">
        <thead className="bg-slate-900/60">
          <tr>
            <th className="px-3 py-2 text-left text-sm text-slate-300">DNI</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Apellido, Nombre</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Nacimiento</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p) => (
            <tr key={p.id} className="border-t border-slate-800 hover:bg-slate-900/40">
              <td className="px-3 py-2 text-sm">{p.dni}</td>
              <td className="px-3 py-2 text-sm"><Link className="text-emerald-300 underline" href={`/patients/${p.id}`}>{p.lastName}, {p.firstName}</Link></td>
              <td className="px-3 py-2 text-sm">{new Date(p.birthDate).toLocaleDateString()}</td>
            </tr>
          ))}
          {items.length === 0 && !isFetching && (
            <tr><td colSpan={3} className="px-3 py-6 text-center text-sm text-slate-400">Sin resultados</td></tr>
          )}
        </tbody>
      </table>

      <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
        <span>Página {page + 1} de {totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page === 0} onClick={() => setPage((p) => Math.max(0, p - 1))} className="rounded border border-slate-700 px-3 py-1 disabled:opacity-50">Anterior</button>
          <button disabled={page + 1 >= totalPages} onClick={() => setPage((p) => p + 1)} className="rounded border border-slate-700 px-3 py-1 disabled:opacity-50">Siguiente</button>
        </div>
      </div>
    </main>
  );
}
