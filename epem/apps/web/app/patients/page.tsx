'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

type Patient = {
  id: string;
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: string;
};

export default function PatientsListPage() {
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
    const token = window.localStorage.getItem('epem_token');
    const headers = new Headers(init?.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  }

  const search = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      const res = await fetchWithAuth(`/patients?${params.toString()}`);
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setItems(data.items ?? []);
    } catch (e: any) {
      setError(e?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { search(); }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pacientes</h1>
        <Link href="/patients/new" className="rounded bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950">Nuevo paciente</Link>
      </div>

      <div className="mb-6 flex gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por DNI o Apellido" className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm" />
        <button onClick={search} className="rounded bg-slate-700 px-4 py-2 text-sm">Buscar</button>
      </div>

      {loading && <p>Cargando…</p>}
      {error && <p className="rounded border border-red-500/40 bg-red-500/10 p-3 text-red-300">{error}</p>}

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
        </tbody>
      </table>
    </main>
  );
}

