'use client';

import { useEffect, useState } from 'react';

type Me = { id: string; email: string; firstName: string; lastName: string; role: string };

async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit) {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('epem_token') : null;
  const headers = new Headers(init?.headers);
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    const rf = await fetch('/auth/refresh', { method: 'POST' });
    if (rf.ok) {
      const data = await rf.json();
      if (data?.accessToken) {
        window.localStorage.setItem('epem_token', data.accessToken);
        headers.set('Authorization', `Bearer ${data.accessToken}`);
        return fetch(input, { ...init, headers });
      }
    }
  }
  return res;
}

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchWithAuth('/users/me');
        if (!res.ok) throw new Error(await res.text());
        setMe(await res.json());
      } catch (e: any) {
        setError(e?.message ?? 'Error');
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-slate-100">
      <h1 className="mb-4 text-3xl font-bold">Perfil</h1>
      {!me && !error && <p>Cargando…</p>}
      {error && <p className="rounded border border-red-500/40 bg-red-500/10 p-3 text-red-300">{error}</p>}
      {me && (
        <div className="space-y-2 rounded border border-slate-700 bg-slate-900/60 p-6">
          <p><span className="text-slate-400">Nombre:</span> {me.firstName} {me.lastName}</p>
          <p><span className="text-slate-400">Email:</span> {me.email}</p>
          <p><span className="text-slate-400">Rol:</span> {me.role}</p>
        </div>
      )}
    </main>
  );
}

