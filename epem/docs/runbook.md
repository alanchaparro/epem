# Runbook de Desarrollo

## Arranque completo
```bash
pnpm install
pnpm dev:reset -NoStart   # (opcional) libera puertos sin arrancar servicios
pnpm dev:reset            # libera puertos y arranca backend + web
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
- CatÃ¡logo: `pnpm --filter @epem/catalog-service seed:items`
- Aseguradoras: `pnpm --filter @epem/billing-service seed:insurers`

## Limpieza rápida de puertos
```powershell
powershell -File scripts/tools/kill-ports.ps1
```
- Usa `Get-NetTCPConnection`/`netstat` para cerrar procesos en 3000, 3001, 3010, 3020, 3030, 3040 y 4000.
- Personaliza la lista con `-Ports 3000,4000` o ejecuta `pnpm dev:reset -NoStart` para el mismo efecto desde el script principal.

## Problemas comunes
- Puertos ocupados â†’ `scripts/tools/kill-ports.ps1` o `pnpm dev:reset -NoStart` antes de volver a levantar servicios.
- 500 desde el front con DOCTYPE â†’ asegÃºrese de usar rutas `/api/...` en los fetch del front (evita colisiones con pÃ¡ginas).
- CORS â†’ configure `CORS_ORIGIN` con la(s) URL(s) permitidas en producciÃ³n.

## Bootstrap (DB + tablas + seeds)
- PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/qa/bootstrap.ps1`
- Crea BDs si faltan (según .env), hace `prisma db push` en cada servicio y ejecuta seeds (omitidos si se llama con `-NoSeeds`, o desde `scripts/qa/run-all.ps1` sin `-RunSeeds`).
- Diagnóstico rápido: `powershell -File scripts/db/ensure-tables.ps1`
- Docker: `./ops/docker/bootstrap.sh` (`ops/docker/bootstrap.ps1` en Windows) prepara MySQL y seeds dentro de los contenedores.
