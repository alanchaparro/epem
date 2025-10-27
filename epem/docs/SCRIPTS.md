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

- PowerShell completo:
  - scripts/qa/run-all.ps1: orquesta bootstrap (opcional), QA backend/front, verificación de BD y observabilidad, y gate final.

## Notas

- `.gitignore` ignora `.next/`, `dist/`, `coverage/`, `test-results/`, `.tmp/`, `node_modules/`, etc.
- Los endpoints de observabilidad de los servicios exponen `GET /metrics/prometheus`.
