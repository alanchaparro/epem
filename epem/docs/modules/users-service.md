# Users Service

Servicio de usuarios y autenticación (NestJS + Prisma + MySQL).

- Puerto: `USERS_SERVICE_PORT` (3020 por defecto)
- Base: `USERS_SERVICE_DATABASE_URL` (ej: `mysql://root:@localhost:3306/epem_users`)

## Endpoints
- `GET /api/health` — estado del servicio
- `POST /api/auth/login` — login con email/password
- `POST /api/auth/refresh` — renueva access token (gateway usa cookie httpOnly)
- `GET /api/users/me` — perfil del usuario autenticado
- `POST /api/users` — alta de usuario (requiere rol ADMIN)
- `GET /api/metrics` — totales de usuarios agrupados por rol (ADMIN/SUPERVISOR)
- `GET /api/metrics/prometheus` — métricas Prometheus (público)

## Ejemplos
```bash
# Login
curl -X POST http://localhost:3020/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@epem.local","password":"admin123"}'

# Perfil (con token)
TOKEN="<accessToken>"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3020/api/users/me
```

## Seeder de ADMIN
- Variables: `ADMIN_EMAIL`, `ADMIN_PASSWORD` (y opcional `ADMIN_RESET_PASSWORD=true`)
- Script: `pnpm --filter @epem/users-service seed:admin`

