# EPEM � Plataforma de Emergencias M�dicas

Quickstart
- Desarrollo: `pnpm dev:one` (Windows) | `bash scripts/quickstart-dev-linux.sh` (Linux)
- Producci�n-like (VPS Linux): `bash scripts/quickstart-prod-linux.sh --with-obs`

 Microservicios en Node.js/NestJS y frontend en Next.js 14 pensados para operar localmente y migrar a un VPS. El dominio funcional se organiza en cuatro pilares:

1. Pacientes
2. Usuarios y roles
3. Servicios cl�nicos
4. Facturaci�n y visaciones

## Requisitos
- Node.js >= 18.18 (recomendado 20.x LTS en VPS)
- pnpm >= 8
- MySQL 8 (local con XAMPP o contenedor)
- PowerShell, Bash o terminal compatible

## Estructura del monorepo
`
.
+- apps/
   +- web/                # Next.js + Tailwind + React Query
+- libs/
   +- nest-common/        # Decoradores, guards e interceptores compartidos (Nest)
+- services/
   +- api-gateway/        # Router principal para coordinar microservicios
   +- patients-service/   # Gesti�n de pacientes
   +- users-service/      # Autenticaci�n, roles y permisos (Prisma + MySQL)
   +- catalog-service/    # Cat�logo de prestaciones cl�nicas
   +- billing-service/    # Facturaci�n y visaciones
+- docs/
   +- todo.md             # Hoja de ruta (opcional)
`

## Deploy r�pido (Compose) � recomendado
Atajo (Linux/VPS en un paso):
`
bash scripts/quickstart-prod-linux.sh --with-obs   # opcional Prometheus/Grafana
# o si tienes pnpm: pnpm deploy:prod:linux -- --with-obs
`
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

Cross-platform en un paso (no interactivo): `pnpm deploy -y`.
Windows en un paso: `pnpm deploy:quick` (copia .env.prod si falta, bootstrap, levanta Compose y corre QA).
Linux/macOS en un paso: `pnpm deploy:quick:sh`.

Detener (Linux/VPS):
`
pnpm deploy:prod:down:linux            # docker compose --env-file .env.prod down
pnpm deploy:prod:down:linux:volumes    # incluye -v (borra vol�menes)
`

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
   - Ajusta en .env las credenciales de MySQL (
oot/contrase�a) y las URLs si us�s host distinto.

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

   # Pacientes (si a�n no existe la BD)
   pnpm --filter @epem/patients-service prisma:generate
   pnpm --filter @epem/patients-service prisma:push
   pnpm --filter @epem/patients-service seed:patients

   # Cat�logo (requiere MySQL y credenciales v�lidas)
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
   - Cat�logo: http://localhost:3030/health
   - Facturaci�n: http://localhost:3040/health
   - Frontend: http://localhost:3000

## Scripts �tiles
- pnpm dev:backend � Solo microservicios y gateway.
  - pnpm dev:web � Solo interfaz Next.js.
  - pnpm build � Compila todos los proyectos.
  - pnpm --filter @epem/nest-common build � Recompila decoradores/guards compartidos.
  - docker compose --env-file .env.prod up -d � Levanta el stack productivo con healthchecks y logging b�sico.
  - pnpm lint � Chequeo de tipos en todos los paquetes.
  - pnpm test � Ejecuta Jest en los servicios y la suite smoke de Playwright (tests e2e con E2E=true).
  - pnpm qa:backend � QA backend multiplataforma (Node wrapper).
  - pnpm --filter @epem/users-service prisma:migrate � Aplica migraciones en entornos productivos.
  - pnpm git:hooks � Configura hooks locales opcionales (desactivados por defecto).
  - pnpm deploy:check � Ejecuta QA backend+frontend tras un deploy.
  - pnpm deploy:prod:linux � Quickstart producci�n-like en Linux (nginx 8080, genera secretos si faltan).
  - pnpm deploy:prod:down:linux � Down de compose de prod (con .env.prod).
  - pnpm deploy:prod:down:linux:volumes � Down con -v.

## QA & Diagn�stico
- Bater�a completa (Windows):
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
- Gate: powershell -File scripts/qa/require-pass.ps1 devuelve 0 cuando todos los reportes est�n en PASS.

## Seguridad
- Antes de desplegar, reemplaza JWT_SECRET y JWT_REFRESH_SECRET en .env.
- No compartas .env ni tokens generados; los scripts QA ya redactan el accessToken, pero evita subir reportes con datos sensibles.

### M�dulo de usuarios
- Endpoint de login: POST /api/auth/login (body { "email": "admin@epem.local", "password": "admin123" }).
- Refresh: POST /api/auth/refresh (con cookie httpOnly epem_rt).
- Creaci�n de usuarios: POST /api/users (requiere token Bearer de un administrador).
- Perfil actual: GET /api/users/me (token Bearer).

### Frontend � vistas
- /login consume http://localhost:4000/auth/login v�a rewrite.
- /profile est� protegido por middleware.ts (requiere cookie epem_rt).
- /patients, /patients/new, /patients/:id
- /catalog, /catalog/new, /catalog/:id
- /insurers, /insurers/:id/coverage
- /admin/users (solo ADMIN): listado, alta, cambio de rol y activacin
- /admin/roles (solo ADMIN): edicin de permisos por m3dulo (read/write)

## Migraci�n a VPS (resumen)
1. Contenerizar con Docker Compose (MySQL + microservicios + frontend).
2. Configurar reverse proxy (Nginx/Traefik) con TLS.
3. Automatizar despliegue con GitHub Actions + registros de contenedores.
4. Supervisar procesos con PM2 u orquestador (Docker/K8s) seg�n escala.
5. Implementar respaldos autom�ticos de MySQL y logs centralizados.


## Documentaci�n
- Gu�a Compose: docs/deploy/docker.md
- Bare metal: docs/deploy/vps.md
- Observabilidad: docs/observability.md y docs/deploy/grafana.md
- Deploy central: docs/DEPLOY.md
- Changelog: CHANGELOG.md
- Scripts de desarrollo y QA: docs/SCRIPTS.md


### Comando �nico de desarrollo
Windows (local):
```
pnpm dev:one
```
Linux/VPS (100% contenedores):
```
bash scripts/quickstart-dev-linux.sh
# o con pnpm: pnpm dev:one:linux
```

`pnpm dev:one` gu�a todo el arranque end-to-end:
- Verifica que `pnpm` est� instalado (si falta, muestra c�mo configurarlo).
- Genera `.env` autom�ticamente (usa `.env.example`) y corre `pnpm install` si detecta que faltan dependencias.
- Arranca MySQL + servicios (o usa Compose Dev si no hay MySQL local), ejecuta QA completo, reintenta ante fallos y te indica qu� reportes revisar.

Detener (dev overlay): `pnpm stop:compose`.

### Comando Docker (desarrollo)
Si prefieres MySQL en contenedor y servicios locales:
`
pnpm dev:docker
`
Variantes: pnpm dev:docker -- -WithObs para Prometheus/Grafana. Para bajar contenedores: pnpm stop:docker.

