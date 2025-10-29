"use client";

import { useEffect, useMemo, useState } from "react";
import AdminNav from "@/components/AdminNav";
import { apiFetch } from "@/lib/api";

type User = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  createdAt: string;
};

type Paged<T> = { items: T[]; total: number };

const ROLES = ["ADMIN","SUPERVISOR","DOCTOR","NURSE","STAFF","BILLING"] as const;

export default function AdminUsersPage() {
  const [data, setData] = useState<Paged<User>>({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiFetch<Paged<User>>(`/users?take=50${q ? `&q=${encodeURIComponent(q)}` : ""}`);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const onRoleChange = async (id: string, role: string) => {
    try {
      await apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify({ role }) });
      await fetchUsers();
    } catch (e) { console.error(e); }
  };

  const onToggleActive = async (u: User) => {
    try {
      await apiFetch(`/users/${u.id}`, { method: 'PATCH', body: JSON.stringify({ isActive: !u.isActive }) });
      await fetchUsers();
    } catch (e) { console.error(e); }
  };

  const onCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const payload = Object.fromEntries(fd.entries());
    try {
      await apiFetch(`/users`, { method: 'POST', body: JSON.stringify(payload) });
      (e.currentTarget as HTMLFormElement).reset();
      await fetchUsers();
    } catch (e) { console.error(e); }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <AdminNav />
      <h1 className="mb-4 text-xl font-semibold text-slate-100">Administración de Usuarios</h1>

      <form onSubmit={onCreate} className="mb-6 grid grid-cols-1 gap-2 rounded border border-slate-800 p-3 sm:grid-cols-6">
        <input name="email" placeholder="email" required className="rounded border border-slate-700 bg-slate-900 p-2 text-slate-100" />
        <input name="password" placeholder="password (min 8)" minLength={8} required className="rounded border border-slate-700 bg-slate-900 p-2 text-slate-100" />
        <input name="firstName" placeholder="nombre" required className="rounded border border-slate-700 bg-slate-900 p-2 text-slate-100" />
        <input name="lastName" placeholder="apellido" required className="rounded border border-slate-700 bg-slate-900 p-2 text-slate-100" />
        <select name="role" className="rounded border border-slate-700 bg-slate-900 p-2 text-slate-100">
          {ROLES.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
        <button className="rounded bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-500">Crear usuario</button>
      </form>

      <div className="mb-2 flex items-center gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="buscar" className="rounded border border-slate-700 bg-slate-900 p-2 text-slate-100" />
        <button onClick={fetchUsers} className="rounded border border-slate-700 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800">Buscar</button>
      </div>

      <div className="overflow-x-auto rounded border border-slate-800">
        <table className="min-w-full text-sm text-slate-200">
          <thead className="bg-slate-900/70">
            <tr>
              <th className="px-3 py-2 text-left">Email</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Rol</th>
              <th className="px-3 py-2 text-left">Activo</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((u) => (
              <tr key={u.id} className="border-t border-slate-800">
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.firstName} {u.lastName}</td>
                <td className="px-3 py-2">
                  <select value={u.role} onChange={(e) => onRoleChange(u.id, e.target.value)} className="rounded border border-slate-700 bg-slate-900 p-1 text-slate-100">
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">{u.isActive ? 'Sí' : 'No'}</td>
                <td className="px-3 py-2 text-right">
                  <button onClick={() => onToggleActive(u)} className="rounded border border-slate-700 px-2 py-1 text-xs hover:bg-slate-800">
                    {u.isActive ? 'Desactivar' : 'Activar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {loading ? <p className="mt-2 text-slate-400">Cargando...</p> : null}
    </div>
  );
}
