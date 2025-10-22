'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NewPatientPage() {
  const router = useRouter();
  const [form, setForm] = useState({ dni: '', firstName: '', lastName: '', birthDate: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
    const token = window.localStorage.getItem('epem_token');
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return fetch(input, { ...init, headers });
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null); setLoading(true);
    try {
      const res = await fetchWithAuth('/patients', { method: 'POST', body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      const created = await res.json();
      router.push(`/patients/${created.id}`);
    } catch (e: any) {
      setError(e?.message ?? 'Error');
    } finally { setLoading(false); }
  };

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Nuevo paciente</h1>
      <form onSubmit={submit} className="space-y-4">
        <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="DNI" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} required />
        <div className="flex gap-4">
          <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Nombre" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Apellido" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
        </div>
        <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} required />
        <button disabled={loading} className="rounded bg-emerald-500 px-4 py-2 text-emerald-950">{loading ? 'Guardando…' : 'Guardar'}</button>
      </form>
      {error && <p className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-red-300">{error}</p>}
    </main>
  );
}

