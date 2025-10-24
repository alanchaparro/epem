# Changelog

All notable changes to this project will be documented in this file.

The format is based on Keep a Changelog, and this project adheres to Semantic Versioning.

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
