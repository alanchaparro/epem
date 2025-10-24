# EPEM — Plataforma de Emergencias Médicas

Microservicios en Node.js/NestJS y frontend en Next.js 14 pensados para operar localmente y migrar a un VPS. El dominio funcional se organiza en cuatro pilares:

1. Pacientes
2. Usuarios y roles
3. Servicios clínicos
4. Facturación y visaciones

## Requisitos
- Node.js >= 18.18 (recomendado 20.x LTS en VPS)
- pnpm >= 8
- MySQL 8 (local con XAMPP o contenedor)
- PowerShell, Bash o terminal compatible

## Estructura del monorepo
`
.
└─ apps/
   └─ web/                # Next.js + Tailwind + React Query
└─ libs/
   └─ nest-common/        # Decoradores, guards e interceptores compartidos (Nest)
└─ services/
   ├─ api-gateway/        # Router principal para coordinar microservicios
   ├─ patients-service/   # Gestión de pacientes
   ├─ users-service/      # Autenticación, roles y permisos (Prisma + MySQL)
   ├─ catalog-service/    # Catálogo de prestaciones clínicas
   └─ billing-service/    # Facturación y visaciones
└─ docs/
   └─ todo.md             # Hoja de ruta (opcional)
`

## Deploy rápido (Compose) — recomendado
1) Copia y completa variables:
`
cp .env.prod.example .env.prod   # o Copy-Item .env.prod.example .env.prod en PowerShell
`
2) Bootstrap (crea tablas + seeds):
`
./ops/docker/bootstrap.sh   # Linux/macOS
powershell -File ops/docker/bootstrap.ps1   # Windows
`
3) Levanta el stack:
`
docker compose --env-file .env.prod up -d
`
4) Verifica con QA:
`
pnpm deploy:check
`
Servicios: Web http://localhost:8080, API Gateway http://localhost:4000, Grafana http://localhost:3001, Prometheus http://localhost:9090.

Cross‑platform en un paso (no interactivo): `pnpm deploy -y`.
Windows en un paso: `pnpm deploy:quick` (copia .env.prod si falta, bootstrap, levanta Compose y corre QA).
Linux/macOS en un paso: `pnpm deploy:quick:sh`.

Opcional (flags):
- Windows PowerShell: `pnpm deploy:quick -- -NoBootstrap -EnvFile .env.staging -TimeoutSec 240`
- Linux/macOS Bash: `pnpm deploy:quick:sh -- --no-bootstrap --env-file .env.staging --timeout 240`

> Alternativa: despliegue bare metal con systemd + Nginx (ver docs/deploy/vps.md).

## Primer uso (desarrolladores)
1. Clonar y copiar variables:
   `ash
   git clone https://github.com/alanchaparro/epem.git
   cd epem
   # Linux/macOS
   cp .env.example .env
   # Windows PowerShell
   Copy-Item .env.example .env
   `
   - Ajusta en .env las credenciales de MySQL (oot/contraseña) y las URLs si usás host distinto.

2. Instalar dependencias (monorepo completo):
   `ash
   pnpm install --no-frozen-lockfile
   `

3. Preparar bases y Prisma (una sola vez):
   `ash
   # Usuarios (crea BD y migraciones)
   pnpm --filter @epem/users-service prisma:generate
   pnpm --filter @epem/users-service prisma:migrate:dev --name init
   pnpm --filter @epem/users-service seed:admin

   # Pacientes (si aún no existe la BD)
   pnpm --filter @epem/patients-service prisma:generate
   pnpm --filter @epem/patients-service prisma:push
   pnpm --filter @epem/patients-service seed:patients

   # Catálogo (requiere MySQL y credenciales válidas)
   pnpm --filter @epem/catalog-service prisma:generate
   pnpm --filter @epem/catalog-service prisma:push
   pnpm --filter @epem/catalog-service seed:items
   `

4. Levantar servicios y frontend (local):
   `ash
   pnpm dev:reset   # cierra procesos en puertos 3000/3010/3020/3030/3040 y arranca todo
   `
   Servicios disponibles:
   - Gateway: http://localhost:4000/health
   - Pacientes: http://localhost:3010/health
   - Usuarios: http://localhost:3020/api/health
   - Catálogo: http://localhost:3030/health
   - Facturación: http://localhost:3040/health
   - Frontend: http://localhost:3000

## Scripts útiles
- pnpm dev:backend — Solo microservicios y gateway.
  - pnpm dev:web — Solo interfaz Next.js.
  - pnpm build — Compila todos los proyectos.
  - pnpm --filter @epem/nest-common build — Recompila decoradores/guards compartidos.
  - docker compose --env-file .env.prod up -d — Levanta el stack productivo con healthchecks y logging básico.
  - pnpm lint — Chequeo de tipos en todos los paquetes.
  - pnpm test — Ejecuta Jest en los servicios y la suite smoke de Playwright (tests e2e con E2E=true).
  - pnpm qa:backend — QA backend multiplataforma (Node wrapper).
  - pnpm --filter @epem/users-service prisma:migrate — Aplica migraciones en entornos productivos.
  - pnpm git:hooks — Configura hooks locales opcionales (desactivados por defecto).
  - pnpm deploy:check — Ejecuta QA backend+frontend tras un deploy.

## QA & Diagnóstico
- Batería completa (Windows):
  `powershell
  powershell -NoProfile -ExecutionPolicy Bypass -File scripts/qa/run-all.ps1
  `
  - Genera reportes en docs/qa/back-report.md, docs/qa/front-report.md, docs/qa/db-report.md.
  - Si algo falla, revisa cada .md y el JSON correspondiente para detalles.
- Checks individuales (multiplataforma):
  `ash
  node scripts/qa/test-back.js    # backend
  node scripts/qa/test-front.js   # frontend
  powershell -File scripts/qa/check-db.ps1  # estructura de BD (Windows)
  `
- DB helper (Windows): powershell -File scripts/db/ensure-tables.ps1 verifica que existan todas las bases/tablas y ejecuta prisma:push si hace falta.
- Gate: powershell -File scripts/qa/require-pass.ps1 devuelve 0 cuando todos los reportes están en PASS.

## Seguridad
- Antes de desplegar, reemplaza JWT_SECRET y JWT_REFRESH_SECRET en .env.
- No compartas .env ni tokens generados; los scripts QA ya redactan el accessToken, pero evita subir reportes con datos sensibles.

### Módulo de usuarios
- Endpoint de login: POST /api/auth/login (body { "email": "admin@epem.local", "password": "admin123" }).
- Refresh: POST /api/auth/refresh (con cookie httpOnly epem_rt).
- Creación de usuarios: POST /api/users (requiere token Bearer de un administrador).
- Perfil actual: GET /api/users/me (token Bearer).

### Frontend — vistas
- /login consume http://localhost:4000/auth/login vía rewrite.
- /profile está protegido por middleware.ts (requiere cookie epem_rt).
- /patients, /patients/new, /patients/:id
- /catalog, /catalog/new, /catalog/:id
- /insurers, /insurers/:id/coverage

## Migración a VPS (resumen)
1. Contenerizar con Docker Compose (MySQL + microservicios + frontend).
2. Configurar reverse proxy (Nginx/Traefik) con TLS.
3. Automatizar despliegue con GitHub Actions + registros de contenedores.
4. Supervisar procesos con PM2 u orquestador (Docker/K8s) según escala.
5. Implementar respaldos automáticos de MySQL y logs centralizados.


## Documentación
- Guía Compose: docs/deploy/docker.md
- Bare metal: docs/deploy/vps.md
- Observabilidad: docs/observability.md y docs/deploy/grafana.md
- Deploy central: docs/DEPLOY.md
- Changelog: CHANGELOG.md
