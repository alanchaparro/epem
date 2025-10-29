# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

## [0.3.1] - 2025-10-28

### Added
- Linux Dev one-command (Docker Compose overlay): `scripts/quickstart-dev-linux.sh` y alias `pnpm dev:one:linux`.
- Linux Prod quickstart (NGINX 8080): `scripts/quickstart-prod-linux.sh` y alias `pnpm deploy:prod:linux`.
- Stop aliases para producción Linux: `pnpm deploy:prod:down:linux` y `pnpm deploy:prod:down:linux:volumes`.
- Generación automática de secretos al inicializar `.env.prod` (si faltan o son placeholders): `DATABASE_PASSWORD`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.
- Archivos informativos con credenciales: `.tmp/dev-linux-info.txt` y `.tmp/prod-linux-info.txt` (se recomienda eliminarlos tras guardarlos de forma segura).
- QA asegurado sin intervención: `pnpm qa:assure` (intenta dev y cae a Compose Dev si es necesario; valida gate PASS).

### Changed
- Documentación separada Windows local vs Linux/VPS en `docs/SCRIPTS.md` (dev y prod), con prerequisitos, salud y stop.

### Notes
- Ambos quickstarts checan salud de `Gateway` y `Web`; el de prod permite `--with-obs` para Prometheus/Grafana.

## [0.2.0] - 2025-10-24

### Added
- Deploy auto (un solo comando): `pnpm deploy` (Node CLI interactivo) y quickstarts por OS (`deploy:quick`, `deploy:quick:sh`).
- Ejemplos de entorno: `.env.staging.example`.
- Frontend hooks + tipos centralizados (Zod) para catálogo, aseguradoras, coberturas y métricas: `apps/web/lib/hooks.ts`, `apps/web/lib/types.ts`.
- Nuevos dashboards Grafana: `ops/grafana/dashboard-observability.json`, `ops/grafana/dashboard-smoke.json`.
- Script utilitario `scripts/web-reset.ps1` con verificación de `/login` y opción `-Detached`.
- `.editorconfig` para normalizar UTF-8, LF e indentación.

### Changed
- Optimización de Prisma en backend:
  - `patients-service`: selects mínimos + `$transaction` en updateStatus (ordenes).
  - `billing-service`: selects mínimos + `$transaction` en issue (facturas).
- Refactor de páginas web para usar hooks/tipos centralizados (Orders, Invoices, Patients list, Dashboard, Catalog, Insurers/Coverage).
- `apps/web/lib/api.ts`: refresh automático del access token ante 401 y reintento único.
- Documentación actualizada y normalizada a UTF‑8:
  - `README.md`, `docs/frontend.md`, `docs/observability.md`, `docs/deploy/grafana.md`, `docs/deploy/vps.md`, `docs/modules/*`.
- Unificación de alertas: fuente canónica en `ops/prometheus/alerts.yml` (archivo de Grafana movido a `docs/ops/archive/alerts-grafana.yaml`).
- `apps/web/next.config.js`: cache en memoria en dev para evitar warnings de Webpack en Windows.

### Removed
- Artefactos de ejecución y backups: `.tmp/logs/*`, `ops/prometheus/prometheus.yml.bak`, `scripts/tmp-ensure-nothing`, `apps/web/test-results/.last-run.json`.

### QA
- Scripts QA fortalecidos:
  - Backend (Node/PS) inyecta Authorization tras login para evitar 401 espurios.
  - Frontend añade check de `POST /auth/login` vía rewrite.
- Gate en PASS (backend, frontend y DB). Ver `docs/qa/*-report.md` y `docs/qa/sign-off.md`.

### Notes
- Prisma avisa actualización mayor disponible (5.22.0 → 6.18.0). Planificar upgrade siguiendo la guía oficial.

[0.2.0]: https://example.com/releases/0.2.0

## [0.3.0] - 2025-10-27

### Added
- One-command local dev with QA: `scripts/quickstart-dev.ps1` + `pnpm dev:one` (levanta servicios, corre QA y valida gate).
- Docker helpers: `scripts/quickstart-docker.ps1` (`pnpm dev:docker`) y Compose Dev 100% contenedores: `docker-compose.dev.yml` + `scripts/quickstart-compose-dev.ps1` (`pnpm dev:compose`).
- Start/Stop utilitarios: `scripts/qa/start-dev.ps1`, `scripts/qa/stop-dev.ps1`, `scripts/qa/stop-all.ps1`, y killer profundo de puertos `scripts/tools/kill-ports-deep.ps1`.
- An�lisis y limpieza: `scripts/analyze/deps.ps1`, `scripts/analyze/orphans.ps1`, `.unimportedrc.json`, `scripts/cleanup.ps1`; `.gitignore` endurecido.
- M�dulo de Administraci�n (Usuarios y Roles):
  - Backend (users-service):
    - Users CRUD parcial para administraci�n: `GET/POST/PATCH/DELETE /api/users` (solo ADMIN).
    - RolePolicy en Prisma y endpoints de pol�ticas: `GET /api/roles`, `PUT /api/roles/:role`, `GET /api/roles/me`.
  - Gateway: proxies `GET/POST /users`, `PATCH/DELETE /users/:id`, `GET/PUT /roles`, `GET /roles/me`.
  - Frontend (Next.js):
    - AdminNav y vistas `/admin/users` y `/admin/roles` con edici�n inmediata (read/write por m�dulo).
    - Men� Admin visible para ADMIN/SUPERVISOR.
- QA Frontend (Playwright):
  - `apps/web/tests/admin.spec.ts` (men� Admin y pantalla de usuarios).
  - `apps/web/tests/roles.spec.ts` (pantalla de roles). Script `pnpm qa:front:e2e` y `pnpm qa:front:e2e:roles`.

### Changed
- Middleware Next protege adem�s: `/patients`, `/catalog`, `/insurers`, `/orders`, `/authorizations`, `/invoices`, `/admin`.
- Limpieza de compilados mezclados en `libs/nest-common/src` (.js/.d.ts eliminados) y normalizaci�n de `package.json` (BOM).
- README.md y docs/SCRIPTS.md actualizados con comandos �nicos, Docker/Compose y nuevas rutas de Admin.
- `package.json` scripts: `dev:start:all`, `dev:stop`, `stop:all`, `dev:one`, `dev:docker`, `stop:docker`, `dev:compose`, `stop:compose`, `qa:front:e2e`, `qa:front:e2e:roles`.

### Fixed
- Ajustes en app.module (gateway) para registrar `RolesProxyController` correctamente.
- `analyze:deps` envuelto en PowerShell para compatibilidad Windows.

### QA
- Gate en PASS con `pnpm dev:one` (backend, frontend y DB). Ver reportes en `docs/qa/`.
- E2E Admin y Roles (smoke) en PASS local.

### Notes
- La prueba E2E de toggle/persistencia de roles requiere estabilidad de cookie httpOnly y puede ser sensible al entorno. Se dej� smoke estable y selectores con `data-testid` para futuras ampliaciones.
[0.3.0]: https://example.com/releases/0.3.0
 [0.3.1]: https://example.com/releases/0.3.1
