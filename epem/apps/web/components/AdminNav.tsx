"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminNav() {
  const pathname = usePathname();
  const linkCls = (href: string) =>
    `px-3 py-2 text-sm rounded hover:bg-slate-800 ${
      pathname === href ? "text-emerald-300" : "text-slate-200"
    }`;
  return (
    <div className="mb-4 flex items-center gap-2 rounded border border-slate-800 bg-slate-900/40 p-2">
      <span className="px-2 text-sm text-slate-400">Admin:</span>
      <Link href="/admin/users" className={linkCls("/admin/users")}>Usuarios</Link>
      <Link href="/admin/roles" className={linkCls("/admin/roles")}>Roles</Link>
    </div>
  );
}

