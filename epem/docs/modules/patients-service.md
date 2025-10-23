# Patients Service

Servicio de pacientes (NestJS + Prisma + MySQL).

- Puerto: `PATIENTS_SERVICE_PORT` (3010 por defecto)
- Base: `PATIENTS_SERVICE_DATABASE_URL` (ej: mysql://root:@localhost:3306/epem)

## Endpoints
- `GET /health` → estado
- `POST /patients` → crear paciente
- `GET /patients?q=&skip=&take=` → listar/buscar con paginación
- `GET /patients/:id` → detalle
- `PATCH /patients/:id` → editar parcialmente
  - Notas: intentar crear con un DNI existente devuelve 409 (conflict) con mensaje claro
- `POST /orders` → crear orden clínica (requiere `patientId`, `serviceItemId`, `insurerId?`, `requiresAuth?`)
- `GET /orders?status=` → listar órdenes (filtrado opcional por estado)
- `PATCH /orders/:id/status` → transición de estado (`PENDING`, `IN_PROGRESS`, `COMPLETED`)

## Ejemplos
```bash
# Listado con búsqueda por DNI/Apellido
curl "http://localhost:3010/patients?q=perez&skip=0&take=20"

# Crear
curl -X POST http://localhost:3010/patients \
  -H 'Content-Type: application/json' \
  -d '{"dni":"20333444","firstName":"Juan","lastName":"Pérez","birthDate":"1990-01-01"}'

# Crear orden con autorización
curl -X POST http://localhost:3010/orders \
  -H 'Content-Type: application/json' \
  -d '{"patientId":"<uuid>","serviceItemId":"LAB01","insurerId":"<uuid>","requiresAuth":true}'
```

## Seed
- `pnpm --filter @epem/patients-service seed:patients`
