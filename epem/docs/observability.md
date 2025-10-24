# Observabilidad y Alertas

## Prometheus
- Corre dentro de Docker Compose (servicio `prometheus`) y consulta `/metrics/prometheus` en cada microservicio.
- Archivo de configuración: `ops/prometheus/prometheus.yml`.
- Expuesto en http://localhost:9090.
- Métricas disponibles:
  - `http_requests_total{service=...,method=...,route=...,status=...}`
  - `http_request_duration_seconds_bucket` (histograma de latencia)
  - Métricas básicas de prom-client (CPU, memoria, etc.)

## Grafana
- Servicio Grafana expuesto en http://localhost:3001.
- Credenciales por `GF_SECURITY_ADMIN_USER` / `GF_SECURITY_ADMIN_PASSWORD` en `.env.prod`.
- Agregar data source Prometheus apuntando a `http://prometheus:9090` desde la administración.
- Dashboards listos para importar:
  - `ops/grafana/dashboard-api.json` (tráfico HTTP)
  - `ops/grafana/dashboard-services.json` (estado general)
  - `ops/grafana/dashboard-observability.json`
  - `ops/grafana/dashboard-smoke.json`
- Reglas de alerta: canónicas en `ops/prometheus/alerts.yml` (cargadas automáticamente por Prometheus).

## Integraciones recomendadas
- Configurar alertas en Grafana (Email/Slack) para:
  - Latencia p95 > 1s (`http_request_duration_seconds_bucket`).
  - `http_requests_total` con status >= 500.
  - Cantidad de facturas en estado DRAFT por encima de un umbral.
- Exportar logs a un colector central (ELK / OpenSearch) para correlacionar eventos.
- Opcional: enviar métricas a un servicio gestionado (Grafana Cloud, Datadog) reutilizando `/metrics/prometheus`.

## Alertas incluidas
- `LatencyHigh`: dispara cuando la latencia p95 supera 1s durante 5 minutos en alguno de los servicios HTTP.
- `ErrorRateHigh`: dispara cuando se registran más de 5 respuestas 5xx por minuto en cualquier servicio.
- Las reglas viven en `ops/prometheus/alerts.yml` y se cargan mediante `rule_files` desde `ops/prometheus/prometheus.yml`. Si preferís Grafana Alerting, creá un Contact point y replicá las reglas como notificaciones gestionadas.

