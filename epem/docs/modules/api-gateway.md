# API Gateway

Orquesta las peticiones del frontend hacia los microservicios y centraliza autenticación.

- Puerto: `API_GATEWAY_PORT` (por defecto 4000)
- CORS: configurable con `CORS_ORIGIN` (lista separada por comas) y `DEFAULT_ORIGIN`
- Rate limiting: `RATE_LIMIT_MAX` peticiones dentro de `RATE_LIMIT_TTL` segundos (Throttler global)
- RBAC: los proxys validan el token JWT y propagan `x-user-id` / `x-user-role` a los servicios internos

## Endpoints

- `GET /health` — estado del gateway (público)
- `POST /auth/login` — reenvía al users-service; setea cookie httpOnly `epem_rt`
- `POST /auth/refresh` — renueva access token desde la cookie (rota refresh token)
- `POST /auth/logout` — borra la cookie httpOnly conservando flags de dominio/origen
- `GET /users/me` — proxy a users-service
- `GET/POST/PATCH /patients/*` — proxy a patients-service (roles: ADMIN/SUPERVISOR/DOCTOR/NURSE/STAFF)
- `GET/POST/PATCH /orders*` — proxy a patients-service (roles: ADMIN/SUPERVISOR/DOCTOR/NURSE/STAFF/BILLING)
- `GET/POST/PATCH /billing/*` — proxy a billing-service (roles: ADMIN/BILLING)
- `GET/POST/PATCH /catalog/items*` — proxy a catalog-service (roles: ADMIN/SUPERVISOR/DOCTOR/BILLING)
- `GET /analytics/metrics` — agrega métricas de todos los servicios para el dashboard
- `GET /analytics/prometheus` — exporta métricas agregadas en formato Prometheus (público, uso interno)
- `GET /metrics/prometheus` — métricas Prometheus propias del gateway

## Ejemplos

Login:
```bash
curl -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@epem.local","password":"admin123"}'
```

Refresco de token (usa cookie httpOnly enviada por el login):
```bash
curl -X POST -b 'epem_rt=<cookie>' http://localhost:4000/auth/refresh
```

Dashboard metrics (requiere token Bearer):
```bash
curl -H 'Authorization: Bearer <token>' http://localhost:4000/analytics/metrics
```

