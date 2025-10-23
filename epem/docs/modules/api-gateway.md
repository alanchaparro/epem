# API Gateway

Orquesta las peticiones del frontend hacia los microservicios y centraliza autenticación.

- Puerto: `API_GATEWAY_PORT` (por defecto 4000)
- CORS: configurable con `CORS_ORIGIN` (separado por comas)

## Endpoints

- `GET /health` → estado del gateway
- `POST /auth/login` → reenvía al users-service; setea cookie httpOnly `epem_rt`
- `POST /auth/refresh` → renueva access token desde la cookie
- `POST /auth/logout` → borra cookie httpOnly
- `GET /users/me` → proxy a users-service
- `GET/POST/PATCH /patients/*` → proxy a patients-service
- `GET/POST/PATCH /billing/insurers*` → proxy a billing-service
- `GET/POST/PATCH /billing/coverage*` → proxy a billing-service

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
