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

## Ejemplos
```bash
# Listado con búsqueda por DNI/Apellido
curl "http://localhost:3010/patients?q=perez&skip=0&take=20"

# Crear
curl -X POST http://localhost:3010/patients \
  -H 'Content-Type: application/json' \
  -d '{"dni":"20333444","firstName":"Juan","lastName":"Pérez","birthDate":"1990-01-01"}'
```

## Seed
- `pnpm --filter @epem/patients-service seed:patients`
