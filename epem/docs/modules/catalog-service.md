# Catalog Service

Servicio de catálogo de prestaciones (NestJS + Prisma + MySQL).

- Puerto: `CATALOG_SERVICE_PORT` (3030 por defecto)
- Base: `CATALOG_SERVICE_DATABASE_URL` (ej: mysql://root:@localhost:3306/epem)

## Endpoints
- `GET /health` → estado
- `POST /catalog/items` → crear prestación (code único)
- `GET /catalog/items?q=&skip=&take=&active=` → listar/buscar con paginación y filtro de activos
- `GET /catalog/items/:id` → detalle de prestación
- `PATCH /catalog/items/:id` → editar (name/description/basePrice/active)

## Ejemplos
```bash
# Listado con búsqueda por código/nombre
curl "http://localhost:3030/catalog/items?q=LAB&skip=0&take=10"

# Crear
curl -X POST http://localhost:3030/catalog/items \
  -H 'Content-Type: application/json' \
  -d '{"code":"LAB99","name":"Análisis QA","basePrice":1234.50}'

# Editar
curl -X PATCH http://localhost:3030/catalog/items/<id> \
  -H 'Content-Type: application/json' \
  -d '{"name":"Análisis QA (edit)","active":false}'
```

## Seeds
- `pnpm --filter @epem/catalog-service seed:items` — carga 15 prestaciones comunes.
