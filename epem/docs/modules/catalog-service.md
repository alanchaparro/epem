# Catalog Service

Microservicio NestJS con Prisma que gestiona las prestaciones clínicas (catálogo).

- Puerto: `CATALOG_SERVICE_PORT` (3030 por defecto)
- Base: `CATALOG_SERVICE_DATABASE_URL`
- RBAC: encabezado `x-user-role` con alguno de `[ADMIN, SUPERVISOR, DOCTOR, BILLING]`

## Endpoints
- `GET /health`
- `GET /metrics` → totales/activos/inactivos de prestaciones
- `GET /metrics/prometheus` → métricas Prometheus (público).
- `POST /catalog/items` → crear prestación (code, name, basePrice, active?, description?)
- `GET /catalog/items?q=&skip=&take=&active=` → listar/buscar con filtros
- `GET /catalog/items/:id`
- `PATCH /catalog/items/:id` → actualizar campos permitidos

## Ejemplos
```bash
curl -H 'x-user-role: ADMIN' http://localhost:3030/metrics

curl -X POST http://localhost:3030/catalog/items \
  -H 'Content-Type: application/json' \
  -H 'x-user-role: ADMIN' \
  -d '{"code":"LAB99","name":"Panel especial","basePrice":12345,"active":true}'
```

## Seeds
- `pnpm --filter @epem/catalog-service seed:items` (idempotente; usa upsert)
