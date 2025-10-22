import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-slate-900 via-slate-950 to-black px-6 py-12 text-center">
      <span className="rounded-full border border-slate-700 bg-slate-900 px-4 py-1 text-xs uppercase tracking-wide text-slate-300">
        MVP en construcción
      </span>
      <h1 className="text-4xl font-bold sm:text-5xl lg:text-6xl">Ecosistema EPEM para emergencias médicas</h1>
      <p className="max-w-2xl text-slate-300">
        Plataforma modular basada en microservicios para coordinar pacientes, usuarios, servicios clínicos y
        facturación con información en tiempo real.
      </p>
      <Link
        href="/login"
        className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400 hover:bg-emerald-400/20"
      >
        Ir al login administrativo
      </Link>
    </main>
  );
}
