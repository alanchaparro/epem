"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import AdminNav from "@/components/AdminNav";

type Policy = { displayName?: string; modules: Record<string, { read: boolean; write: boolean }> };
type ModulesMeta = Record<string, { label: string; description?: string }>;

export default function RolesPage() {
  const [policies, setPolicies] = useState<Record<string, Policy>>({});
  const [modulesMeta, setModulesMeta] = useState<ModulesMeta>({});
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState<{ role: string; mod: string } | null>(null);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<any>('/roles');
      if (data?.roles) {
        setPolicies(data.roles);
        setModulesMeta(data.modulesMeta || {});
      } else {
        setPolicies(data || {});
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPolicies(); }, []);

  const onToggle = async (role: string, mod: string, key: 'read'|'write') => {
    const next = structuredClone(policies);
    next[role] = next[role] || { modules: {} as any };
    next[role].modules[mod] = next[role].modules[mod] || { read: false, write: false };
    next[role].modules[mod][key] = !next[role].modules[mod][key];
    setPolicies(next);
    try {
      await apiFetch(`/roles/${role}`, { method: 'PUT', body: JSON.stringify({ modules: next[role].modules }) });
    } catch (e) { console.error(e); fetchPolicies(); }
  };

  const onRenameRole = async (role: string, displayName: string) => {
    const next = structuredClone(policies);
    next[role] = next[role] || { modules: {} as any };
    next[role].displayName = displayName;
    setPolicies(next);
    try { await apiFetch(`/roles/${role}`, { method: 'PUT', body: JSON.stringify({ displayName }) }); }
    catch (e) { console.error(e); fetchPolicies(); }
  };

  const roles = Object.keys(policies);
  const modules = Array.from(new Set(roles.flatMap(r => Object.keys(policies[r]?.modules || {}))));
  const moduleLabel = (m: string) => modulesMeta[m]?.label || m;
  const moduleDesc = (m: string) => modulesMeta[m]?.description || '';

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <AdminNav />
      <h1 className="mb-4 text-xl font-semibold text-slate-100">Roles y Permisos</h1>
      {focused && (
        <div className="mb-3 rounded border border-emerald-700/40 bg-emerald-900/10 p-3 text-sm text-emerald-200">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-emerald-300">Módulo:</span>
            <span className="inline-block rounded-full bg-emerald-800/40 px-2 py-0.5 text-xs">
              {moduleLabel(focused.mod)}
            </span>
            {moduleDesc(focused.mod) && (
              <span className="text-emerald-200/80">— {moduleDesc(focused.mod)}</span>
            )}
          </div>
          <div className="mt-1 text-emerald-200/90">
            Rol: <span className="font-medium">{policies[focused.role]?.displayName || focused.role}</span>
          </div>
        </div>
      )}
      {loading ? <p className="text-slate-400">Cargando...</p> : null}
      {!loading && (
      <div className="overflow-x-auto rounded border border-slate-800" data-testid="roles-table-wrap">
          <table className="min-w-full text-sm text-slate-200" data-testid="roles-table">
            <thead className="bg-slate-900/70">
              <tr>
                <th className="px-3 py-2 text-left">Rol</th>
                {modules.map(m => (
                  <th key={m} className="px-3 py-2 text-left" title={moduleDesc(m)}>
                    <span className="inline-block rounded-full bg-slate-800 px-2 py-0.5 text-xs">
                      {moduleLabel(m)}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roles.map(role => (
                <tr key={role} className="border-t border-slate-800" data-testid={`role-row-${role}`}>
                  <td className="px-3 py-2 font-medium">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{role}</span>
                      <input
                        className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-slate-100"
                        style={{ width: 160 }}
                        defaultValue={policies[role]?.displayName || role}
                        onBlur={(e) => onRenameRole(role, e.target.value)}
                        title="Nombre para mostrar del rol"
                      />
                    </div>
                  </td>
                  {modules.map(m => (
                    <td key={m} className="px-3 py-2" data-testid={`cell-${role}-${m}`} onMouseEnter={() => setFocused({ role, mod: m })}>
                      <label className="mr-2 inline-flex items-center gap-1 text-xs" data-testid={`lbl-${role}-${m}-read`}>
                        <input
                          data-testid={`cb-${role}-${m}-read`}
                          type="checkbox"
                          checked={!!policies[role]?.modules?.[m]?.read}
                          onChange={() => onToggle(role, m, 'read')}
                          onFocus={() => setFocused({ role, mod: m })}
                        /> read
                      </label>
                      <label className="inline-flex items-center gap-1 text-xs" data-testid={`lbl-${role}-${m}-write`}>
                        <input
                          data-testid={`cb-${role}-${m}-write`}
                          type="checkbox"
                          checked={!!policies[role]?.modules?.[m]?.write}
                          onChange={() => onToggle(role, m, 'write')}
                          onFocus={() => setFocused({ role, mod: m })}
                        /> write
                      </label>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
