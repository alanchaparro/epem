# Billing Service

Servicio de facturación y visaciones (NestJS + Prisma + MySQL).

- Puerto: `BILLING_SERVICE_PORT` (3040 por defecto)
- Base: `BILLING_SERVICE_DATABASE_URL` (ej: mysql://root:@localhost:3306/epem)

## Endpoints
- `GET /health` → estado del servicio
- `GET /authorizations?status=` → listar autorizaciones por estado
- `POST /authorizations` → crear autorización (desde pacientes cuando se crea una orden)
- `PATCH /authorizations/:id` → aprobar/denegar autorización (actualiza orden en pacientes)
- `GET /insurers` → lista aseguradoras
- `GET /insurers/:id` → detalle
- `POST /insurers` → alta (body: `{ name, planCode, active? }`)
- `PATCH /insurers/:id` → edición parcial (activar/desactivar, actualizar nombre)
- `GET /coverage?insurerId=` → coberturas por aseguradora
- `POST /coverage` → alta (body: `{ insurerId, serviceItemId, copay, requiresAuth? }`)
- `PATCH /coverage/:id` → edición (copay, requiresAuth, serviceItemId)

Todos los endpoints responden 4xx con mensaje descriptivo cuando la aseguradora o cobertura no existen.

## Ejemplos
```bash
# Listado de aseguradoras
curl http://localhost:3040/insurers

# Crear aseguradora
curl -X POST http://localhost:3040/insurers \
  -H 'Content-Type: application/json' \
  -d '{"name":"Cobertura QA","planCode":"PLAN-QA","active":true}'

# Crear cobertura
curl -X POST http://localhost:3040/coverage \
  -H 'Content-Type: application/json' \
  -d '{"insurerId":"<uuid>","serviceItemId":"LAB01","copay":450,"requiresAuth":false}'

# Aprobar autorización
curl -X PATCH http://localhost:3040/authorizations/<id> \
  -H 'Content-Type: application/json' \
  -d '{"status":"APPROVED","authCode":"AUTH123"}'
```

## Seeds
- `pnpm --filter @epem/billing-service seed:insurers` — crea 3 aseguradoras demo + coberturas básicas.

## Roadmap funcional
- Próximas fases agregarán órdenes, autorizaciones y facturas sobre esta base (ver fase 4+ de la hoja de ruta).

## Desarrollo local
- `pnpm --filter @epem/billing-service prisma:generate`
- `pnpm --filter @epem/billing-service prisma:push`
- `pnpm --filter @epem/billing-service run dev`
