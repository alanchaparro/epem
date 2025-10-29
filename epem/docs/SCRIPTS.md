# Scripts de desarrollo y QA

Esta guía documenta los scripts agregados para facilitar tareas comunes en desarrollo, limpieza y análisis.

## Arranque/stop de servicios

- pnpm dev:start:all
  - Inicia MySQL (XAMPP) si está disponible y, salvo que se indique lo contrario, ejecuta bootstrap (Prisma db push/generate + seeds).
  - Levanta en segundo plano:
    - users (3020), patients (3010), catalog (3030), billing (3040), api-gateway (4000) y web (3000).
  - Flags:
    - -- -NoBootstrap para saltar bootstrap
    - -- -NoSeeds para omitir seeds
  - PIDs guardados en `.tmp/dev-pids.json`.

- pnpm dev:stop:pids
  - Detiene los procesos usando `.tmp/dev-pids.json`.

- pnpm dev:stop
  - Detiene por PIDs y luego libera puertos residuales ejecutando `scripts/dev-reset.ps1 -NoStart`.

- pnpm stop:all
  - Alto de todo el proyecto: detiene por PIDs y puertos, baja Docker Compose si corresponde y termina procesos locales de MySQL.

## Limpieza

- pnpm clean
  - Elimina artefactos generados y caches: `.next`, `services/*/dist`, `libs/**/dist`, `.tmp`, `.turbo`, `.parcel-cache`, `.vite`.

- pnpm clean:deep
  - Igual que `clean`, además elimina `node_modules` y `dist/` de la raíz.

## Análisis

- pnpm analyze:deps
  - Wrapper (PowerShell) de `madge` compatible con Windows para detectar ciclos entre:
    `services/**/src`, `apps/web/app`, `apps/web/lib`.

- pnpm analyze:orphans
  - Heurística de archivos potencialmente huérfanos con exclusiones para entrypoints de Next y Nest.

- node scripts/secrets-scan.js
  - Escaneo básico de patrones de secretos. Marca `.env` reales y cadenas con "password=", claves, etc.

## QA

- pnpm deploy:check
  - Ejecuta QA backend y frontend rápidos.

- pnpm qa:assure
  - Garantiza PASS sin intervención: intenta entorno local dev; si falla, cae automáticamente a Compose Dev y valida gate.

- PowerShell completo:
  - scripts/qa/run-all.ps1: orquesta bootstrap (opcional), QA backend/front, verificación de BD y observabilidad, y gate final.

## Notas

- `.gitignore` ignora `.next/`, `dist/`, `coverage/`, `test-results/`, `.tmp/`, `node_modules/`, etc.
- Los endpoints de observabilidad de los servicios exponen `GET /metrics/prometheus`.
- Windows: si ves errores EPERM en Prisma al generar `query_engine-windows.dll.node`, excluye la carpeta del repo en Windows Defender/AV. Los scripts ya limpian locks y reintentan, pero la exclusión evita bloqueos esporádicos.


## Comando único (Windows local)```powershell
# Levanta BD + servicios + frontend, corre QA y valida PASS
pnpm dev:one
```

Requisitos previos
- Node ≥ 18.18 y PNPM ≥ 8 instalados
- MySQL 8 disponible (XAMPP local o contenedor)
- Variables en `.env` configuradas (DB, puertos, JWT, etc.)

Comportamiento
- Si web (3000) y gateway (4000) ya responden, salta el arranque y ejecuta solo QA + gate.
- Si no están arriba, ejecuta bootstrap (Prisma push/generate + seeds), levanta users/patients/catalog/billing/gateway/web y luego corre QA backend y frontend. Si el gate falla, devuelve error.

Flags útiles
- `pnpm dev:one -- -NoSeeds` omite la siembra inicial de datos.
- `pnpm dev:one -- -SkipObservability` salta el QA de observabilidad.


## Comando único (Linux/VPS)
```
# Recomendado (no requiere pnpm en el host)
bash scripts/quickstart-dev-linux.sh

# O vía PNPM, si lo tienes instalado
pnpm dev:one:linux
```

Requisitos previos (Linux)
- Docker + Docker Compose (plugin) instalados

Comportamiento (Linux)
- Si falta `.env.prod`, se inicializa desde `.env.prod.example` y se generan valores seguros para:
  - `DATABASE_PASSWORD` (MySQL root)
  - `JWT_SECRET` y `JWT_REFRESH_SECRET`
- Arranca `mysql` + `pnpm-install` + servicios + `web` en contenedores
- Espera health de `http://localhost:4000/health` y `http://localhost:3000/login`
- Crea `.tmp/dev-linux-info.txt` con datos sensibles (usuario y contraseña MySQL, URLs). Se recomienda eliminar ese archivo después de guardarlos.

Para detener el stack (Linux):
- `pnpm stop:compose` baja el compose combinado (`docker-compose.yml` + `docker-compose.dev.yml`).

## Producción (Linux/VPS)
```
# Recomendado (sin pnpm):
bash scripts/quickstart-prod-linux.sh --with-obs   # opcional observabilidad

# O vía PNPM:
pnpm deploy:prod:linux -- --with-obs
```

Requisitos
- Docker + Docker Compose (plugin)

Comportamiento
- Usa `docker-compose.yml` con NGINX en 8080, Gateway en 4000, MySQL en 3306.
- Asegura `.env.prod` (genera `DATABASE_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET` si faltan o son placeholders).
- Opción `--with-obs` levanta Prometheus (9090) y Grafana (3001).
- Espera health de `http://localhost:4000/health` y `http://localhost:8080/login`.
- Escribe `.tmp/prod-linux-info.txt` con credenciales sensibles (MySQL y, si corresponde, Grafana). Se recomienda eliminar ese archivo tras guardar la info.

Detener
- `pnpm deploy:prod:down:linux` (equivale a `docker compose --env-file .env.prod down`)
- `pnpm deploy:prod:down:linux:volumes` para eliminar volúmenes (`-v`)


## Comando Docker (desarrollo)
`
# Arranca MySQL (Docker) + servicios locales + QA
pnpm dev:docker

# Variantes
pnpm dev:docker -- -WithObs     # incluye Prometheus/Grafana
pnpm dev:docker -- -NoSeeds     # no ejecuta seeds iniciales
pnpm stop:docker                # baja los contenedores Docker (no detiene servicios locales)
`


## QA Frontend (Playwright)
`
pnpm qa:front:e2e            # ejecuta e2e de Admin/menú (tests/admin.spec.ts)
# Para ver el trace/report: pnpm --filter @epem/web exec playwright show-report
`


## Administración (Roles)
- UI: /admin/roles (solo ADMIN). Marca/desmarca permisos por módulo y se guardan automáticamente.
- API equivalentes vía gateway:
  - GET /roles → políticas por rol
  - PUT /roles/:role → actualiza política del rol
  - GET /roles/me → política del usuario actual

