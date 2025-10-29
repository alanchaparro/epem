'use client';

import { FormEvent, useState } from 'react';

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
};

// Página de login administrativa.
// - Envío a /auth/login del gateway
// - Guarda accessToken en localStorage y redirige a /profile
export default function LoginPage() {
  const [email, setEmail] = useState('admin@epem.local');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<LoginResponse | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      const endpoint = `/auth/login`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const raw = await response.text();
        let message = 'Credenciales inválidas.';
        if (raw) {
          try {
            const parsed: any = JSON.parse(raw);
            const msgFrom = (obj: any): string | undefined => {
              if (!obj) return undefined;
              if (typeof obj === 'string') return obj;
              if (Array.isArray(obj)) return obj.join(' ');
              return obj.detail || obj.title || obj.error || obj.message || undefined;
            };
            const candidate =
              msgFrom(parsed?.message && typeof parsed.message !== 'string' ? parsed.message : parsed?.message) ||
              msgFrom(parsed);
            if (candidate) message = candidate; else message = raw;
          } catch { message = raw; }
        }
        throw new Error(message);
      }

      const data = await response.json() as LoginResponse;
      setSuccess(data);
      window.localStorage.setItem('epem_token', data.accessToken);
      setTimeout(() => { window.location.href = '/profile'; }, 400);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl backdrop-blur">
        <div className="mb-8 text-center">
          <span className="text-sm uppercase tracking-widest text-slate-400">EPEM</span>
          <h1 className="mt-2 text-2xl font-semibold text-slate-50">Acceso administrativo</h1>
          <p className="mt-1 text-sm text-slate-400">Ingresa con tus credenciales del módulo de usuarios.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" autoComplete="email" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-200" htmlFor="password">Contraseña</label>
            <input id="password" type="password" autoComplete="current-password" className="w-full rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-slate-100 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <button type="submit" disabled={loading} className="flex w-full items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? 'Verificando...' : 'Iniciar sesión'}
          </button>
        </form>

        {error && <p className="mt-6 rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>}
        {success && (
          <div className="mt-6 space-y-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
            <p>Autenticación correcta.</p>
            <p>
              <span className="font-semibold text-emerald-100">Token guardado</span> en `localStorage` como <code className="text-xs text-emerald-100">epem_token</code>.
            </p>
            <p>
              Usuario: {success.user.firstName} {success.user.lastName} · {success.user.email}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
