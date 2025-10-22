"use client";

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

const schema = z.object({
  code: z.string().min(2).max(32),
  name: z.string().min(2).max(120),
  description: z.string().max(500).optional().or(z.literal('')),
  basePrice: z.coerce.number().min(0),
  active: z.boolean().optional(),
});

type FormValues = z.infer<typeof schema>;

export default function NewItemPage() {
  const router = useRouter();
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { active: true } });
  const mutation = useMutation({
    mutationFn: (data: FormValues) => apiFetch('/api/catalog/items', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (created) => { toast.success('Prestación creada'); router.push(`/catalog/${created.id}`); },
    onError: (e: any) => toast.error(e?.message ?? 'Error al crear prestación'),
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Nueva prestación</h1>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Código" {...form.register('code')} />
        <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Nombre" {...form.register('name')} />
        <textarea className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Descripción (opcional)" {...form.register('description')} />
        <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Precio base" type="number" step="0.01" {...form.register('basePrice')} />
        <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" {...form.register('active')} /> Activo</label>
        <button disabled={mutation.isPending} className="rounded bg-emerald-500 px-4 py-2 text-emerald-950">{mutation.isPending ? 'Guardando…' : 'Guardar'}</button>
      </form>
      <div className="mt-2 space-y-1 text-sm text-red-300">
        {Object.values(form.formState.errors).map((e, i) => (<p key={i}>{(e as any).message}</p>))}
      </div>
    </main>
  );
}

