"use client";

// Barra de navegación superior del frontend.
// - Muestra enlaces a Pacientes/Perfil
// - Detecta sesión (token en localStorage)
// - Implementa logout llamando al gateway y limpiando el token

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Nav() {
  const [authed, setAuthed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setAuthed(!!window.localStorage.getItem("epem_token"));
  }, [pathname]);

  const logout = async () => {
    try {
      await fetch("/auth/logout", { method: "POST", credentials: "include" });
    } catch {}
    window.localStorage.removeItem("epem_token");
    setAuthed(false);
    router.push("/login");
  };

  const linkCls = (href: string) =>
    `px-3 py-2 text-sm rounded hover:bg-slate-800 ${pathname === href ? "text-emerald-300" : "text-slate-200"}`;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="text-lg font-semibold text-slate-100">EPEM</Link>
          <div className="ml-4 hidden gap-1 sm:flex">
            <Link href="/patients" className={linkCls("/patients")}>Pacientes</Link>
            <Link href="/catalog" className={linkCls("/catalog")}>Catálogo</Link>
            <Link href="/insurers" className={linkCls("/insurers")}>Aseguradoras</Link>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!authed ? (
            <Link href="/login" className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-200">Iniciar sesión</Link>
          ) : (
            <>
              <Link href="/profile" className={linkCls("/profile")}>Perfil</Link>
              <button onClick={logout} className="rounded border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800">Salir</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
