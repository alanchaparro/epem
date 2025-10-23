# EPEM – Plataforma de Emergencias Médicas

Microservicios en Node.js/NestJS y frontend en Next.js 14 pensados para operar localmente y migrar a un VPS. El dominio funcional se organiza en cuatro pilares:

1. Pacientes
2. Usuarios y roles
3. Servicios clínicos
4. Facturación y visaciones

## Requisitos
- Node.js >= 18.18
- pnpm >= 8
- MySQL 8 (local con XAMPP o contenedor)
- PowerShell, Bash o terminal compatible

## Estructura del monorepo
```
.
├─ apps/
│  └─ web/                # Next.js + Tailwind + React Query
├─ services/
│  ├─ api-gateway/        # Router principal para coordinar microservicios
│  ├─ patients-service/   # Gestión de pacientes
│  ├─ users-service/      # Autenticación, roles y permisos (Prisma + MySQL)
│  ├─ catalog-service/    # Catálogo de prestaciones clínicas
│  └─ billing-service/    # Facturación y visaciones
└─ docs/
   └─ todo.md             # Hoja de ruta (opcional)
```

## Primer uso (desarrolladores)
1. **Clonar y copiar variables:**
   ```bash
   git clone https://github.com/alanchaparro/epem.git
   cd epem
   cp .env.example .env
   ```
   - Ajusta en `.env` las credenciales de MySQL (`root`/contraseña) y las URLs si usás host distinto.

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

   # Pacientes (si aún no existe la BD)
   pnpm --filter @epem/patients-service prisma:generate
   pnpm --filter @epem/patients-service prisma:push
   pnpm --filter @epem/patients-service seed:patients

   # Catálogo (requiere MySQL y credenciales válidas)
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
   - Catálogo: http://localhost:3030/health
   - Facturación: http://localhost:3040/health
   - Frontend: http://localhost:3000

> ¿Problemas? Verifica que MySQL esté corriendo y que cada BD exista. `scripts/qa/run-all.ps1` puede automatizar el bootstrap completo en Windows.

## Scripts útiles
- `pnpm dev:backend` – Solo microservicios y gateway.
- `pnpm dev:web` – Solo interfaz Next.js.
- `pnpm build` – Compila todos los proyectos.
- `pnpm --filter @epem/users-service prisma:migrate` – Aplica migraciones en entornos productivos.
- `pnpm git:hooks` – Configura hooks locales opcionales (desactivados por defecto).

## QA & Diagnóstico
- **Batería completa (Windows):**
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
- **Gate:** `powershell -File scripts/qa/require-pass.ps1` devuelve 0 cuando todos los reportes están en PASS.

## Seeds disponibles
- Usuarios (admin): `pnpm --filter @epem/users-service seed:admin`
- Pacientes demo: `pnpm --filter @epem/patients-service seed:patients`
- Catálogo demo: `pnpm --filter @epem/catalog-service seed:items`
- Aseguradoras demo: `pnpm --filter @epem/billing-service seed:insurers`

## Seguridad
- Antes de desplegar, reemplaza los valores por defecto de `JWT_SECRET` y `JWT_REFRESH_SECRET` en `.env`.
- No compartas `.env` ni los tokens generados en los reportes; los scripts QA ya redactan el accessToken, pero evita subir reportes con datos sensibles.

### Módulo de usuarios
- Endpoint de login: `POST /api/auth/login` (body `{ "email": "admin@epem.local", "password": "admin123" }`).
- Refresh: `POST /api/auth/refresh` (con cookie httpOnly `epem_rt`).
- Creación de usuarios: `POST /api/users` (requiere token Bearer de un administrador).
- Perfil actual: `GET /api/users/me` (token Bearer).

### Frontend – vistas
- `/login` consume `http://localhost:4000/auth/login` vía rewrite.
- `/profile` está protegido por `middleware.ts` (requiere cookie `epem_rt`).
- `/patients`, `/patients/new`, `/patients/:id`
- `/catalog`, `/catalog/new`, `/catalog/:id`
- `/insurers`, `/insurers/:id/coverage`

## Migración a VPS (resumen)
1. Contenerizar con Docker Compose (MySQL + microservicios + frontend).  
2. Configurar reverse proxy (Nginx/Traefik) con certificados TLS.  
3. Automatizar despliegue con GitHub Actions + registros de contenedores.  
4. Supervisar procesos con PM2 u orquestador (Docker/K8s) según escala.  
5. Implementar respaldos automáticos de MySQL y logs centralizados.
