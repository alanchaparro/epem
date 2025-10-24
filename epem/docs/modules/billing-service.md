# Billing Service

Microservicio NestJS responsable de aseguradoras, coberturas, autorizaciones y facturación preliminar.

- Puerto: `BILLING_SERVICE_PORT` (3040)
- Base: `BILLING_SERVICE_DATABASE_URL`
- RBAC: requiere `x-user-role` con `[ADMIN, BILLING]`

## Endpoints
- `GET /health`
- `GET /metrics` → totales de aseguradoras/coberturas + breakdown de autorizaciones/invoices por estado
- `GET /metrics/prometheus` → métricas Prometheus (público).
- `GET /insurers` / `POST /insurers` / `PATCH /insurers/:id`
- `GET /coverage?insurerId=` / `POST /coverage` / `PATCH /coverage/:id`
- `GET /authorizations?status=` / `POST /authorizations` / `PATCH /authorizations/:id`
- `GET /invoices?status=` / `GET /invoices/:id` / `POST /invoices` / `PATCH /invoices/:id/issue`

## Ejemplos
```bash
# Métricas (requiere rol billing)
curl -H 'x-user-role: BILLING' http://localhost:3040/metrics

# Alta de factura (orden debe estar COMPLETED)
curl -X POST http://localhost:3040/invoices \
  -H 'Content-Type: application/json' \
  -H 'x-user-role: BILLING' \
  -d '{"orderId":"<uuid>"}'
```

## Seeds
- `pnpm --filter @epem/billing-service seed:insurers`
