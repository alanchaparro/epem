# EPEM â€“ Plataforma de Emergencias MÃ©dicas

Microservicios en Node.js/NestJS y frontend en Next.js 14 pensados para operar localmente y migrar a un VPS. El dominio funcional se organiza en cuatro pilares:

1. Pacientes
2. Usuarios y roles
3. Servicios clÃ­nicos
4. FacturaciÃ³n y visaciones

## Requisitos
- Node.js >= 18.18
- pnpm >= 8
- MySQL 8 (local con XAMPP o contenedor)
- PowerShell, Bash o terminal compatible

## Estructura del monorepo
```
.
â”œâ”€ apps/
â”‚  â””â”€ web/                # Next.js + Tailwind + React Query
â”œâ”€ libs/
â”‚  â””â”€ nest-common/        # Decoradores, guards e interceptores compartidos (Nest)
â”œâ”€ services/
â”‚  â”œâ”€ api-gateway/        # Router principal para coordinar microservicios
â”‚  â”œâ”€ patients-service/   # GestiÃ³n de pacientes
â”‚  â”œâ”€ users-service/      # AutenticaciÃ³n, roles y permisos (Prisma + MySQL)
â”‚  â”œâ”€ catalog-service/    # CatÃ¡logo de prestaciones clÃ­nicas
â”‚  â””â”€ billing-service/    # FacturaciÃ³n y visaciones
â””â”€ docs/
   â””â”€ todo.md             # Hoja de ruta (opcional)
```

## Primer uso (desarrolladores)
1. **Clonar y copiar variables:**
   ```bash
   git clone https://github.com/alanchaparro/epem.git
   cd epem
   cp .env.example .env
   ```
   - Ajusta en `.env` las credenciales de MySQL (`root`/contraseÃ±a) y las URLs si usÃ¡s host distinto.

2. **Instalar dependencias (monorepo completo):**
   ```bash
   pnpm install --no-frozen-lockfile
   ```

3. **Preparar bases y Prisma (una sola vez):**
   ```bash
   # Usuarios (crea BD y migraciones)
   pnpm --filter @epem/users-service prisma:generate
   pnpm --filter @epem/users-service prisma:migrate:dev --name init
   pnpm --filter @epem/users-service seed:admin

   # Pacientes (si aÃºn no existe la BD)
   pnpm --filter @epem/patients-service prisma:generate
   pnpm --filter @epem/patients-service prisma:push
   pnpm --filter @epem/patients-service seed:patients

   # CatÃ¡logo (requiere MySQL y credenciales vÃ¡lidas)
   pnpm --filter @epem/catalog-service prisma:generate
   pnpm --filter @epem/catalog-service prisma:push
   pnpm --filter @epem/catalog-service seed:items
   ```

4. **Levantar servicios y frontend:**
   ```bash
   pnpm dev:reset   # cierra procesos en puertos 3000/3010/3020/3030/3040 y arranca todo
   ```
   Servicios disponibles:
   - Gateway: http://localhost:4000/health
   - Pacientes: http://localhost:3010/health
   - Usuarios: http://localhost:3020/api/health
   - CatÃ¡logo: http://localhost:3030/health
   - FacturaciÃ³n: http://localhost:3040/health
   - Frontend: http://localhost:3000

> Â¿Problemas? Verifica que MySQL estÃ© corriendo y que cada BD exista. `scripts/qa/run-all.ps1` puede automatizar el bootstrap completo en Windows.

## Scripts Ãºtiles
- `pnpm dev:backend` â€“ Solo microservicios y gateway.
- `pnpm dev:web` â€“ Solo interfaz Next.js.
- `pnpm build` â€“ Compila todos los proyectos.
- `pnpm --filter @epem/nest-common build` â€“ Recompila decoradores/guards compartidos (útil si tocaste `libs/nest-common`).
- `pnpm --filter @epem/users-service prisma:migrate` â€“ Aplica migraciones en entornos productivos.
- `pnpm git:hooks` â€“ Configura hooks locales opcionales (desactivados por defecto).

## QA & DiagnÃ³stico
- **BaterÃ­a completa (Windows):**
  ```powershell
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/qa/run-all.ps1
  ```
  - Genera reportes en `docs/qa/back-report.md`, `docs/qa/front-report.md`, `docs/qa/db-report.md`.
  - Si algo falla, revisa cada archivo `.md` y el JSON correspondiente para detalles.
- **Checks individuales (multiplataforma):**
  ```bash
  node scripts/qa/test-back.js    # backend
  node scripts/qa/test-front.js   # frontend
  powershell -File scripts/qa/check-db.ps1  # estructura de BD (en Windows)
  ```
- **DB helper (Windows):** `powershell -File scripts/db/ensure-tables.ps1` verifica que todas las bases/tablas existan y ejecuta `prisma:push` si hace falta.
- **Gate:** `powershell -File scripts/qa/require-pass.ps1` devuelve 0 cuando todos los reportes estÃ¡n en PASS.

## Fase 6 — Dashboard + RBAC + Hardening
- Dashboard `/dashboard` con métricas agregadas desde todos los servicios (`GET /analytics/metrics`).
- RBAC end-to-end: el gateway valida JWT, propaga `x-user-role`/`x-user-id` y cada microservicio protege sus controladores.
- Rate limiting básico (Throttler) y CORS endurecido (`CORS_ORIGIN`, `DEFAULT_ORIGIN`).
- Cookies de refresh token con flags configurables (`COOKIE_DOMAIN`, `COOKIE_SECURE`, `COOKIE_SAMESITE`).
- Endpoints `/metrics` en users/patients/catalog/billing para integraciones y monitoreo.
## Fase 7 — Operación Contenerizada
- Dockerfiles multi-stage + `docker-compose.yml` para correr todos los servicios.
- Scripts de bootstrap (`ops/docker/bootstrap.sh` / `.ps1`) crean tablas y seeds dentro de los contenedores.
- Configuración de CORS y rewrites basada en `API_GATEWAY_URL` para compatibilidad dentro de la red de Docker.
- Nuevos ejemplos en `.env.prod.example` y guía detallada en `docs/deploy/docker.md`.


## Fase 8 — Observabilidad & Alertas
- Métricas Prometheus (`/metrics/prometheus`) en gateway y microservicios, con interceptores que contabilizan solicitudes y latencias.
- Endpoints agregados: `/analytics/prometheus` (gateway agrega métricas externas) y docs en `docs/observability.md`.
- Docker Compose suma Prometheus (9090) y Grafana (3001) para monitoreo rápido.
- QA valida que el agregador de métricas exponga `http_requests_total`.

## Seeds disponibles
- Usuarios (admin): `pnpm --filter @epem/users-service seed:admin`
- Pacientes demo: `pnpm --filter @epem/patients-service seed:patients`
- CatÃ¡logo demo: `pnpm --filter @epem/catalog-service seed:items`
- Aseguradoras demo: `pnpm --filter @epem/billing-service seed:insurers`

## Docker Compose
Consulta `docs/deploy/docker.md` para pasos completos.

Resumido:
1. `cp .env.prod.example .env.prod` y completa secretos.
2. Ejecutá `./ops/docker/bootstrap.sh` (o `.ps1`) para `prisma db push` + seeds.
3. Levantá el stack con `docker compose --env-file .env.prod up -d`.
4. Accedé a http://localhost:8080 y al gateway en http://localhost:4000.
5. Para limpiar: `docker compose down` o `docker compose down -v` (borra volumen MySQL).


## Seguridad
- Antes de desplegar, reemplaza los valores por defecto de `JWT_SECRET` y `JWT_REFRESH_SECRET` en `.env`.
- No compartas `.env` ni los tokens generados en los reportes; los scripts QA ya redactan el accessToken, pero evita subir reportes con datos sensibles.

### MÃ³dulo de usuarios
- Endpoint de login: `POST /api/auth/login` (body `{ "email": "admin@epem.local", "password": "admin123" }`).
- Refresh: `POST /api/auth/refresh` (con cookie httpOnly `epem_rt`).
- CreaciÃ³n de usuarios: `POST /api/users` (requiere token Bearer de un administrador).
- Perfil actual: `GET /api/users/me` (token Bearer).

### Frontend â€“ vistas
- `/login` consume `http://localhost:4000/auth/login` vÃ­a rewrite.
- `/profile` estÃ¡ protegido por `middleware.ts` (requiere cookie `epem_rt`).
- `/patients`, `/patients/new`, `/patients/:id`
- `/catalog`, `/catalog/new`, `/catalog/:id`
- `/insurers`, `/insurers/:id/coverage`

## MigraciÃ³n a VPS (resumen)
1. Contenerizar con Docker Compose (MySQL + microservicios + frontend).  
2. Configurar reverse proxy (Nginx/Traefik) con certificados TLS.  
3. Automatizar despliegue con GitHub Actions + registros de contenedores.  
4. Supervisar procesos con PM2 u orquestador (Docker/K8s) segÃºn escala.  
5. Implementar respaldos automÃ¡ticos de MySQL y logs centralizados.
