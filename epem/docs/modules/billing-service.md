# Billing Service

Servicio de facturación y visaciones (NestJS + MySQL). Actualmente expone un health básico y es el punto de partida para órdenes, autorizaciones y facturas en fases posteriores.

- Puerto: `BILLING_SERVICE_PORT` (3040 por defecto)
- Base: reutiliza el mismo MySQL definido en `.env` (pendiente de esquema propio en fases futuras)

## Endpoints
- `GET /health` → estado del servicio

## Roadmap funcional
- Visaciones y coberturas se gestionarán a través del billing-service cuando los módulos de órdenes/autorizaciones estén disponibles.
- Documentar nuevos endpoints aquí a medida que se incorporen (por ejemplo: `/insurers`, `/coverage`, `/invoices`).

## Desarrollo local
- Arranque rápido: `pnpm --filter @epem/billing-service run dev`
- Al trabajar en nuevos endpoints, añade las dependencias necesarias a `services/billing-service/package.json` y ejecuta `pnpm install --filter @epem/billing-service`.
