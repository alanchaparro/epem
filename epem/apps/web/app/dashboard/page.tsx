'use client';

import { useEffect, useMemo } from 'react';
import toast from 'react-hot-toast';
import { useDashboardMetrics } from '@/lib/hooks';

// Tipado y validación se centralizan en apps/web/lib/types.ts

const statusColors: Record<string, string> = {
  PENDING: 'text-amber-300',
  IN_PROGRESS: 'text-sky-300',
  COMPLETED: 'text-emerald-300',
  APPROVED: 'text-emerald-300',
  DENIED: 'text-rose-300',
  DRAFT: 'text-amber-300',
  ISSUED: 'text-emerald-300',
};

function StatCard({ title, value, helper }: { title: string; value: number; helper?: string }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-5 shadow-lg shadow-black/30">
      <p className="text-sm uppercase tracking-wide text-slate-400">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-emerald-300">{value.toLocaleString('es-AR')}</p>
      {helper ? <p className="mt-1 text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

export default function DashboardPage() {
  const metricsQuery = useDashboardMetrics();

  useEffect(() => {
    if (metricsQuery.isError) {
      const message = (metricsQuery.error as Error | undefined)?.message ?? 'No se pudo cargar el dashboard';
      toast.error(message);
    }
  }, [metricsQuery.isError, metricsQuery.error]);

  const metrics = metricsQuery.data;
  const patientsTotal = metrics?.patients.patients?.total ?? 0;
  const ordersTotal = metrics?.patients.orders?.total ?? 0;
  const ordersByStatus = metrics?.patients.orders?.byStatus ?? {};
  const serviceItems = metrics?.catalog.serviceItems;
  const invoicesByStatus = metrics?.billing.invoices?.byStatus ?? {};
  const authorizationsByStatus = metrics?.billing.authorizations?.byStatus ?? {};
  const usersByRole = metrics?.users.users?.byRole ?? {};

  const authorizationEntries = useMemo(() => Object.entries(authorizationsByStatus), [authorizationsByStatus]);
  const invoiceEntries = useMemo(() => Object.entries(invoicesByStatus), [invoicesByStatus]);
  const orderEntries = useMemo(() => Object.entries(ordersByStatus), [ordersByStatus]);
  const roleEntries = useMemo(() => Object.entries(usersByRole), [usersByRole]);

  return (
    <main className="mx-auto max-w-7xl space-y-8 px-6 py-10">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold text-slate-100">Dashboard operativo</h1>
        <p className="text-sm text-slate-400">
          Seguimiento rápido del estado de pacientes, órdenes, autorizaciones y facturación preliminar.
        </p>
      </section>

      {metricsQuery.isFetching ? (
        <p className="text-sm text-slate-400">Cargando métricas…</p>
      ) : null}

      {metrics ? (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard title="Pacientes registrados" value={patientsTotal} helper="Fuente: patients-service" />
            <StatCard
              title="Órdenes activas"
              value={ordersTotal}
              helper={`${ordersByStatus['PENDING'] ?? 0} pendientes · ${ordersByStatus['IN_PROGRESS'] ?? 0} en curso`}
            />
            <StatCard
              title="Prestaciones en catálogo"
              value={serviceItems?.total ?? 0}
              helper={`${serviceItems?.active ?? 0} activas · ${serviceItems?.inactive ?? 0} inactivas`}
            />
            <StatCard
              title="Facturas generadas"
              value={metrics.billing.invoices?.total ?? 0}
              helper={`${invoicesByStatus['DRAFT'] ?? 0} borradores · ${invoicesByStatus['ISSUED'] ?? 0} emitidas`}
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-slate-100">Órdenes por estado</h2>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {orderEntries.length > 0 ? (
                  orderEntries.map(([status, count]) => (
                    <li
                      key={status}
                      className="flex items-center justify-between rounded border border-slate-800/60 bg-slate-950/30 px-3 py-2"
                    >
                      <span className={`font-medium ${statusColors[status] ?? 'text-slate-200'}`}>{status}</span>
                      <span className="text-slate-200">{count}</span>
                    </li>
                  ))
                ) : (
                  <li className="rounded border border-slate-800/60 bg-slate-950/30 px-3 py-2 text-slate-400">
                    No hay órdenes registradas todavía.
                  </li>
                )}
              </ul>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
              <h2 className="text-lg font-semibold text-slate-100">Autorizaciones y facturación</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-slate-400">Autorizaciones</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-200">
                    {authorizationEntries.length > 0 ? (
                      authorizationEntries.map(([status, count]) => (
                        <li key={status} className="flex justify-between">
                          <span className={statusColors[status] ?? 'text-slate-200'}>{status}</span>
                          <span>{count}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400">Sin registros.</li>
                    )}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Facturas</p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-200">
                    {invoiceEntries.length > 0 ? (
                      invoiceEntries.map(([status, count]) => (
                        <li key={status} className="flex justify-between">
                          <span className={statusColors[status] ?? 'text-slate-200'}>{status}</span>
                          <span>{count}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-slate-400">Generá una factura desde una orden completada.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-6">
            <h2 className="text-lg font-semibold text-slate-100">Distribución de roles</h2>
            <p className="text-xs text-slate-500">Fuente: users-service /metrics</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {roleEntries.length > 0 ? (
                roleEntries.map(([role, count]) => (
                  <div key={role} className="rounded border border-slate-800/60 bg-slate-950/30 px-3 py-3 text-sm text-slate-200">
                    <p className="font-semibold text-slate-100">{role}</p>
                    <p className="mt-1 text-emerald-300">{count}</p>
                  </div>
                ))
              ) : (
                <div className="rounded border border-slate-800/60 bg-slate-950/30 px-3 py-3 text-sm text-slate-400">
                  Aún no hay usuarios adicionales. Usa el módulo de usuarios para crearlos.
                </div>
              )}
            </div>
          </section>
        </>
      ) : metricsQuery.isError ? (
        <p className="rounded border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          No se pudieron obtener las métricas del sistema.
        </p>
      ) : null}
    </main>
  );
}
