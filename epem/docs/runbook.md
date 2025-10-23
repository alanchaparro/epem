# Runbook de Desarrollo

## Arranque completo
```bash
pnpm install
pnpm dev:reset # libera puertos y arranca backend + web
```

- Gateway: http://localhost:4000/health
- Users: http://localhost:3020/api/health
- Patients: http://localhost:3010/health
- Web: http://localhost:3000 (o 3001 si 3000 ocupado)

## Migraciones / Prisma
- Users: `pnpm --filter @epem/users-service prisma:generate`
- Patients: `pnpm --filter @epem/patients-service prisma:generate`
- Catalog: `pnpm --filter @epem/catalog-service prisma:generate`
- Billing: `pnpm --filter @epem/billing-service prisma:generate`

> En Windows, si aparece EPERM durante `prisma generate`, cierre procesos Node, borre `node_modules/.prisma` y reintente.

## Seeds
- Admin: `pnpm --filter @epem/users-service seed:admin`
- Pacientes: `pnpm --filter @epem/patients-service seed:patients`
- Catálogo: `pnpm --filter @epem/catalog-service seed:items`
- Aseguradoras: `pnpm --filter @epem/billing-service seed:insurers`

## Problemas comunes
- Puertos ocupados → `pnpm dev:reset` (usa PowerShell para matar PIDs por puerto)
- 500 desde el front con DOCTYPE → asegúrese de usar rutas `/api/...` en los fetch del front (evita colisiones con páginas).
- CORS → configure `CORS_ORIGIN` con la(s) URL(s) permitidas en producción.

## Bootstrap (DB + tablas + seeds)
- PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/qa/bootstrap.ps1`
- Crea BDs si faltan (según .env), hace `prisma db push` en cada servicio y ejecuta seeds.
