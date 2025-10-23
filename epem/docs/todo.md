# Emergency Services Platform – To‑Do

## Objetivos iniciales
- Establecer arquitectura de microservicios para los cuatro pilares: pacientes, usuarios, servicios clínicos, facturación y visaciones.
- Preparar entorno monorepo con arranque único para backend y frontend.
- Asegurar compatibilidad local (Windows + XAMPP/MySQL) y futura migración a VPS Linux.

## Hoja de ruta

### 1. Fundamentos del monorepo
- [x] Elegir gestor de paquetes (pnpm) y habilitar workspaces.
- [x] Configurar TypeScript base compartida (`tsconfig.base.json`).
- [x] Definir scripts centrales (`pnpm dev`, `pnpm build`).
- [x] Preparar archivo `.env.example`.

### 2. Backend (Node.js)
- [x] Microservicios NestJS: patients, users, catalog, billing.
- [x] API Gateway con proxies de auth y perfil.
- [x] Prisma + MySQL en `users-service` con seeder de admin.
- [ ] Encolar eventos (RabbitMQ/Redis) para notificaciones.
- [ ] Pruebas unitarias (Jest) por servicio.

### 3. Frontend (Next.js 14)
- [x] App `apps/web` + Tailwind.
- [x] Login + Profile protegidos con middleware.
- [ ] UI clínica con shadcn/ui.

### 4. Infraestructura
- [x] Scripts `pnpm dev`, `dev:backend`, por servicio.
- [ ] Docker Compose (fase VPS).
- [ ] CI/CD (GitHub Actions).

### 5. Seguridad
- [x] JWT + refresh httpOnly en gateway.
- [ ] Actualizar Next.js a >= 14.2.32 para mitigar CVEs.
- [ ] Ejecutar `pnpm audit` tras cada actualización crítica y documentar remanentes.
- [ ] Monitorear advisory GHSA-9965-vmph-33xx (validator) hasta que exista parche.
- [ ] Auditoría y trazabilidad.
- [ ] Cifrado de campos sensibles.
