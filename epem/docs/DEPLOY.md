# Deploy Guide

Este documento centraliza caminos de despliegue y comandos de verificación para desarrolladores.

## Opción A — Docker Compose (recomendada)

1) Variables
- Copia `.env.prod.example` a `.env.prod` y completa secretos/URLs.
- Opcional: usa `.env.staging.example` como base para staging.

2) Bootstrap + levantar
```
# Linux/macOS
./ops/docker/bootstrap.sh && docker compose --env-file .env.prod up -d
# Windows
powershell -File ops/docker/bootstrap.ps1; docker compose --env-file .env.prod up -d
```

3) Verificar QA
```
pnpm deploy:check
```

Quickstart 1 paso
- Cross‑platform: `pnpm deploy -y` (no interactivo; usa defaults y genera secretos básicos)
- Cross‑platform (interactivo): `pnpm deploy` (pregunta envfile, URLs y secrets mínimos)
- Windows: `pnpm deploy:quick`
- Linux/macOS: `pnpm deploy:quick:sh`
- Staging: `pnpm deploy:staging:win` o `pnpm deploy:staging:sh`

### Build & Push a un registry
Para publicar imágenes en un registry (Docker Hub, GHCR):

```
# Windows
pnpm images:build:push          # te pedirá prefijo (ej: docker.io/usuario) y tag (default latest)

# Linux/macOS
pnpm images:build:push:sh
```

Las imágenes se nombran como `${REGISTRY_PREFIX}/{users-service|patients-service|catalog-service|billing-service|api-gateway|web}:${IMAGE_TAG}`.
El archivo `docker-compose.yml` ya soporta `REGISTRY_PREFIX` y `IMAGE_TAG`.

## Opción B — Bare metal (systemd + Nginx)
Sigue `docs/deploy/vps.md` para crear servicios systemd por microservicio, configurar Nginx+TLS y ejecutar `pnpm deploy:check` como smoke final.

## Notas
- Revisa observabilidad en `docs/observability.md` y `docs/deploy/grafana.md` (dashboards + alertas).
- Cambios relevantes entre versiones: `CHANGELOG.md`.
