# Patients Service

Servicio de pacientes (NestJS + Prisma + MySQL).

- Puerto: `PATIENTS_SERVICE_PORT` (3010 por defecto)
- Base: `PATIENTS_SERVICE_DATABASE_URL` (ej: `mysql://root:@localhost:3306/epem`)
- RBAC: requiere encabezado `x-user-role` con alguno de `[ADMIN, SUPERVISOR, DOCTOR, NURSE, STAFF]`

## Endpoints
- `GET /health` — estado
- `GET /metrics` — resumen de pacientes y órdenes (totales + breakdown por estado)
- `GET /metrics/prometheus` — métricas Prometheus (público)
- `POST /patients` — crear paciente
- `GET /patients?q=&skip=&take=` — listar/buscar con paginación
- `GET /patients/:id` — detalle
- `PATCH /patients/:id` — editar parcialmente (409 si DNI duplicado)
- `POST /orders` — crear orden clínica (requiere `patientId`, `serviceItemId`, `insurerId?`, `requiresAuth?`)
- `GET /orders?status=` — listar órdenes (filtrado opcional por estado)
- `PATCH /orders/:id/status` — transición de estado (`PENDING`, `IN_PROGRESS`, `COMPLETED`)

## Ejemplos
```bash
# Listado con búsqueda por DNI/Apellido (vía gateway)
curl -H 'Authorization: Bearer <token>' http://localhost:4000/patients?q=perez&skip=0&take=20

# Crear paciente directo al servicio (requiere rol)
curl -X POST http://localhost:3010/patients \
  -H 'Content-Type: application/json' \
  -H 'x-user-role: ADMIN' \
  -d '{"dni":"20333444","firstName":"Juan","lastName":"Pérez","birthDate":"1990-01-01"}'

# Métricas (devuelve totals + estados)
curl -H 'x-user-role: ADMIN' http://localhost:3010/metrics
```

## Seed
- `pnpm --filter @epem/patients-service seed:patients`

