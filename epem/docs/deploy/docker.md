# Guía de despliegue con Docker Compose

## .env.prod mínimo (ejemplo)
Completa al menos estas variables en `.env.prod`:
```
# API/Gateway
API_GATEWAY_URL=http://localhost:4000
JWT_SECRET=super-secreto
JWT_REFRESH_SECRET=otro-super-secreto
CORS_ORIGIN=http://localhost:8080
DEFAULT_ORIGIN=http://localhost:8080

# Bases de datos (ajustar credenciales/host)
USERS_SERVICE_DATABASE_URL=mysql://root:@mysql:3306/epem_users
PATIENTS_SERVICE_DATABASE_URL=mysql://root:@mysql:3306/epem
CATALOG_SERVICE_DATABASE_URL=mysql://root:@mysql:3306/epem_catalog

# Grafana (opcional)
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=admin
```

## 1. Preparar variables

1. Copiá `.env.prod.example` a `.env.prod` y completá los valores esenciales (ver ejemplo anterior).
2. Revisa los `*_SERVICE_DATABASE_URL` (por defecto apuntan al contenedor `mysql`).

## 2. Bootstrap de bases y seeds

```
chmod +x ops/docker/bootstrap.sh
./ops/docker/bootstrap.sh        # Linux / macOS

# o en Windows
powershell -File ops/docker/bootstrap.ps1
```

Esto compila las imágenes, levanta MySQL y ejecuta `prisma db push` + seeds para todos los servicios.

## 3. Levantar el stack

```
docker compose --env-file .env.prod up -d
```

Servicios expuestos:

| Servicio          | URL interna                 | Puerto |
| ----------------- | --------------------------- | ------ |
| Nginx (frontend)  | `http://localhost:8080`     | 8080   |
| API Gateway       | `http://localhost:4000`     | 4000   |
| Users Service     | `http://localhost:3020/api` | 3020   |
| Patients Service  | `http://localhost:3010`     | 3010   |
| Catalog Service   | `http://localhost:3030`     | 3030   |
| Billing Service   | `http://localhost:3040`     | 3040   |
| MySQL             | `mysql:3306` (dentro red)   | 3306   |
| Prometheus        | `http://localhost:9090`     | 9090   |
| Grafana           | `http://localhost:3001`     | 3001   |

## 4. Operaciones comunes

| Acción                   | Comando                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------- |
| Ver logs                 | `docker compose logs -f api-gateway`                                                         |
| Ejecutar prisma push     | `docker compose run --rm patients-service pnpm --filter @epem/patients-service prisma:push` |
| Ejecutar seeds           | `docker compose run --rm catalog-service pnpm --filter @epem/catalog-service seed:items`    |
| Apagar el stack          | `docker compose down`                                                                        |
| Apagar y borrar volumen  | `docker compose down -v`                                                                     |

## 5. Healthchecks

Con el stack arriba, podés validar:

```
curl http://localhost:4000/health
curl http://localhost:8080/login
curl http://localhost:8080/api/analytics/metrics
curl http://localhost:4000/analytics/prometheus
```

> El frontend funciona detrás de Nginx, que reescribe `/api/*`, `/auth/*` y otras rutas directamente al API Gateway dentro de la red de Docker.

## 6. Limpieza

Para limpiar imágenes adicionales generadas durante pruebas:

```
docker image prune --filter label=stage=epem -f
```

(opcional) o usa `docker system prune` con cuidado.

## 7. Observabilidad
- Prometheus se expone en `http://localhost:9090` y scrapea `/metrics/prometheus` de cada servicio.
- Grafana se expone en `http://localhost:3001` (credenciales `GF_SECURITY_ADMIN_USER` / `GF_SECURITY_ADMIN_PASSWORD`).
- Puedes importar los dashboards JSON de `ops/grafana/`.

