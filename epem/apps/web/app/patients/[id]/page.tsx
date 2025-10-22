'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function PatientDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id as string;
  const [patient, setPatient] = useState<any>(null);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
    const token = window.localStorage.getItem('epem_token');
    const headers = new Headers(init?.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
    return fetch(input, { ...init, headers });
  }

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth(`/patients/${id}`);
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setPatient(data);
        setForm({
          dni: data.dni,
          firstName: data.firstName,
          lastName: data.lastName,
          birthDate: data.birthDate?.slice(0, 10),
          phone: data.phone ?? '',
          email: data.email ?? '',
          address: data.address ?? '',
          emergencyContact: data.emergencyContact ?? '',
          allergies: data.allergies ?? '',
          notes: data.notes ?? '',
        });
      } catch (e: any) { setError(e?.message ?? 'Error'); }
    })();
  }, [id]);

  const save = async () => {
    try {
      setSaving(true); setError(null);
      const res = await fetchWithAuth(`/patients/${id}`, { method: 'PATCH', body: JSON.stringify(form) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setPatient(data);
    } catch (e: any) { setError(e?.message ?? 'Error'); } finally { setSaving(false); }
  };

  if (!patient) return <main className="p-6">Cargando…</main>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{form.lastName}, {form.firstName}</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm">DNI<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} /></label>
        <label className="text-sm">Fecha de nacimiento<input type="date" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} /></label>
        <label className="text-sm">Nombre<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} /></label>
        <label className="text-sm">Apellido<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} /></label>
        <label className="text-sm">Teléfono<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
        <label className="text-sm">Email<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label className="text-sm sm:col-span-2">Dirección<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} /></label>
        <label className="text-sm sm:col-span-2">Contacto de emergencia<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" value={form.emergencyContact} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} /></label>
        <label className="text-sm sm:col-span-2">Alergias<textarea className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" value={form.allergies} onChange={(e) => setForm({ ...form, allergies: e.target.value })} /></label>
        <label className="text-sm sm:col-span-2">Notas<textarea className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></label>
      </div>
      <div className="mt-6 flex gap-3">
        <button disabled={saving} onClick={save} className="rounded bg-emerald-500 px-4 py-2 text-emerald-950">{saving ? 'Guardando…' : 'Guardar cambios'}</button>
      </div>
      {error && <p className="mt-4 rounded border border-red-500/40 bg-red-500/10 p-3 text-red-300">{error}</p>}
    </main>
  );
}

