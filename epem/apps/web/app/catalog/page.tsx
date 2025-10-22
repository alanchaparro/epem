"use client";

import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

type Item = { id: string; code: string; name: string; basePrice: string | number; active: boolean };
const PAGE = 20;

export default function CatalogListPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const { data, isFetching } = useQuery({
    queryKey: ['catalog', { q, page }],
    queryFn: async () => {
      const params = new URLSearchParams({ q, skip: String(page * PAGE), take: String(PAGE) });
      try { return await apiFetch(`/api/catalog/items?${params.toString()}`); }
      catch (e: any) { toast.error(e?.message ?? 'Error al cargar catálogo'); throw e; }
    }
  });

  const items: Item[] = data?.items ?? [];
  const total: number = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Catálogo</h1>
        <Link href="/catalog/new" className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950">Nueva prestación</Link>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por código o nombre" className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm" />
        <button onClick={() => setPage(0)} className="rounded bg-slate-700 px-4 py-2 text-sm">Buscar</button>
      </div>

      {isFetching && <p>Cargando…</p>}
      <table className="w-full table-auto border-collapse overflow-hidden rounded border border-slate-800">
        <thead className="bg-slate-900/60">
          <tr>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Código</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Nombre</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Precio</th>
            <th className="px-3 py-2 text-left text-sm text-slate-300">Activo</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id} className="border-t border-slate-800 hover:bg-slate-900/40">
              <td className="px-3 py-2 text-sm">{it.code}</td>
              <td className="px-3 py-2 text-sm"><Link className="text-emerald-300 underline" href={`/catalog/${it.id}`}>{it.name}</Link></td>
              <td className="px-3 py-2 text-sm">${typeof it.basePrice === 'string' ? it.basePrice : it.basePrice.toFixed(2)}</td>
              <td className="px-3 py-2 text-sm">{it.active ? 'Sí' : 'No'}</td>
            </tr>
          ))}
          {items.length === 0 && !isFetching && (<tr><td colSpan={4} className="px-3 py-6 text-center text-sm text-slate-400">Sin resultados</td></tr>)}
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

