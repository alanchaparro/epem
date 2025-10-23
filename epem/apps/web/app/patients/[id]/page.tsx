'use client';

import { useParams } from 'next/navigation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';

// Esquema zod para validar el formulario de edición.
const schema = z.object({
  dni: z.string().min(6).max(20),
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  birthDate: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
  allergies: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;
type Patient = FormValues & { id: string };

// Página de detalle/edición de paciente
export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>() as any;

  const { data, isFetching } = useQuery<Patient>({
    queryKey: ['patient', id],
    queryFn: () => apiFetch<Patient>(`/api/patients/${id}`),
    enabled: !!id,
  });

  const form = useForm<FormValues>({ resolver: zodResolver(schema), values: data ? {
    dni: data.dni ?? '',
    firstName: data.firstName ?? '',
    lastName: data.lastName ?? '',
    birthDate: data.birthDate?.slice(0,10) ?? '',
    phone: data.phone ?? '',
    email: data.email ?? '',
    address: data.address ?? '',
    emergencyContact: data.emergencyContact ?? '',
    allergies: data.allergies ?? '',
    notes: data.notes ?? '',
  } : undefined });

  const mutation = useMutation<Patient, Error, FormValues>({
    mutationFn: (payload) => apiFetch<Patient>(`/api/patients/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
    onSuccess: () => toast.success('Cambios guardados'),
    onError: (e) => toast.error(e?.message ?? 'Error al guardar'),
  });

  if (!data || isFetching) return <main className="p-6">Cargando…</main>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold">{data.lastName}, {data.firstName}</h1>
      <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm">DNI<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('dni')} /></label>
        <label className="text-sm">Fecha de nacimiento<input type="date" className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('birthDate')} /></label>
        <label className="text-sm">Nombre<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('firstName')} /></label>
        <label className="text-sm">Apellido<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('lastName')} /></label>
        <label className="text-sm">Teléfono<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('phone')} /></label>
        <label className="text-sm">Email<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('email')} /></label>
        <label className="text-sm sm:col-span-2">Dirección<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('address')} /></label>
        <label className="text-sm sm:col-span-2">Contacto de emergencia<input className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('emergencyContact')} /></label>
        <label className="text-sm sm:col-span-2">Alergias<textarea className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('allergies')} /></label>
        <label className="text-sm sm:col-span-2">Notas<textarea className="mt-1 w-full rounded border border-slate-700 bg-slate-900 px-3 py-2" {...form.register('notes')} /></label>
        <div className="sm:col-span-2 mt-2">
          <button disabled={mutation.isPending} className="rounded bg-emerald-500 px-4 py-2 text-emerald-950">{mutation.isPending ? 'Guardando…' : 'Guardar cambios'}</button>
        </div>
      </form>
      <div className="mt-2 space-y-1 text-sm text-red-300">
        {Object.values(form.formState.errors).map((e, i) => (
          <p key={i}>{e.message as string}</p>
        ))}
      </div>
    </main>
  );
}
