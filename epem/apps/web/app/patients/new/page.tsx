'use client';

import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { apiFetch } from '@/lib/api';

const schema = z.object({
  dni: z.string().min(6, 'DNI inválido').max(20),
  firstName: z.string().min(1, 'Nombre requerido').max(80),
  lastName: z.string().min(1, 'Apellido requerido').max(80),
  birthDate: z.string().min(1, 'Fecha requerida'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

export default function NewPatientPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: (data: FormValues) => apiFetch('/api/patients', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (created) => {
      toast.success('Paciente creado');
      router.push(`/patients/${created.id}`);
    },
    onError: (e: any) => toast.error(e?.message ?? 'Error al crear paciente'),
  });

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">Nuevo paciente</h1>
      <form onSubmit={handleSubmit((v) => mutation.mutate(v))} className="space-y-4">
        <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="DNI" {...register('dni')} />
        <div className="flex gap-4">
          <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Nombre" {...register('firstName')} />
          <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Apellido" {...register('lastName')} />
        </div>
        <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" type="date" {...register('birthDate')} />
        <div className="flex gap-4">
          <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Teléfono" {...register('phone')} />
          <input className="w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" placeholder="Email" {...register('email')} />
        </div>
        <button disabled={isSubmitting || mutation.isPending} className="rounded bg-emerald-500 px-4 py-2 text-emerald-950">
          {mutation.isPending ? 'Guardando…' : 'Guardar'}
        </button>
      </form>
      <div className="mt-2 space-y-1 text-sm text-red-300">
        {Object.values(errors).map((e, i) => (
          <p key={i}>{e.message}</p>
        ))}
      </div>
    </main>
  );
}
