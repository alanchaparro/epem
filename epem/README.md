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

## Primer uso
1. Copiar variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Instalar dependencias y preparar Prisma (crea antes la base `epem_users` en MySQL):
   ```bash
   pnpm install
   pnpm --filter @epem/users-service prisma:generate
   pnpm --filter @epem/users-service prisma:migrate:dev --name init
   pnpm --filter @epem/users-service seed:admin
   ```
3. Levantar todo el entorno (gateway, microservicios y frontend):
   ```bash
   pnpm dev
   ```
   - Gateway: http://localhost:4000/health  
   - Pacientes: http://localhost:3010/health  
   - Usuarios: http://localhost:3020/api/health  
   - Catálogo: http://localhost:3030/health  
   - Facturación: http://localhost:3040/health  
   - Frontend: http://localhost:3000

> Nota: Cada servicio usa `dotenv` y las variables definidas en `.env`. Ajusta puertos o credenciales MySQL según tu entorno local.

## Scripts útiles
- `pnpm dev:backend` – Solo microservicios y gateway.
- `pnpm dev:web` – Solo interfaz Next.js.
- `pnpm build` – Compila todos los proyectos.
- `pnpm --filter @epem/users-service prisma:migrate` – Aplica migraciones en entornos productivos.
- `pnpm git:hooks` – Configura los hooks de git para bloquear pushes sin aprobación.

## Política de push (aprobación requerida)
- Este repo bloquea `git push` por defecto mediante un hook (`.githooks/pre-push`).
- Para permitir UN push:
  - Opción rápida: `echo ok > .allow-push && git push`
  - Windows: `powershell -File scripts/approve-push.ps1` y luego `git push`
  - Unix: `bash scripts/approve-push.sh && git push`
  - Temporal: `ALLOW_PUSH=1 git push`
- Instalar hooks (una vez): `pnpm git:hooks`

### Módulo de usuarios
- Endpoint de login: `POST /api/auth/login` (body `{ "email": "admin@epem.local", "password": "admin123" }`).
- Refresh: `POST /api/auth/refresh` (con cookie httpOnly `epem_rt`).
- Creación de usuarios: `POST /api/users` (requiere token Bearer de un administrador).
- Perfil actual: `GET /api/users/me` (token Bearer).

### Frontend – vistas
- `/login` consume `http://localhost:4000/auth/login` vía rewrite.
- `/profile` está protegido por `middleware.ts` (requiere cookie `epem_rt`).

## Migración a VPS (resumen)
1. Contenerizar con Docker Compose (MySQL + microservicios + frontend).  
2. Configurar reverse proxy (Nginx/Traefik) con certificados TLS.  
3. Automatizar despliegue con GitHub Actions + registros de contenedores.  
4. Supervisar procesos con PM2 u orquestador (Docker/K8s) según escala.  
5. Implementar respaldos automáticos de MySQL y logs centralizados.
