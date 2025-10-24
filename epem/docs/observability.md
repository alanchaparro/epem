# Observabilidad y Alertas

## Prometheus
- Corre dentro de Docker Compose (prometheus service) y consulta /metrics/prometheus en cada microservicio.
- Archivo de configuración: ops/prometheus/prometheus.yml.
- Expuesto en http://localhost:9090.
- Métricas disponibles:
  - http_requests_total{service=...,method=...,route=...,status=...}
  - http_request_duration_seconds_bucket (histograma de latencia)
  - Métricas básicas de prom-client (CPU, memoria, etc.).

## Grafana
- Servicio grafana expuesto en http://localhost:3001.
- Credenciales se controlan con GF_SECURITY_ADMIN_USER / GF_SECURITY_ADMIN_PASSWORD en .env.prod.
- Agregar data source Prometheus apuntando a http://prometheus:9090 desde la vista de administración.
- Recomendado importar dashboard ID 1860 (Prometheus Stats) y personalizar paneles con filtros service.

## Integraciones recomendadas
- Configurar alertas en Grafana (Email/Slack) para:
  - Latencia p95 > 1s (http_request_duration_seconds_bucket).
  - http_requests_total con status >= 500.
  - Cantidad de facturas en estado DRAFT por encima de un umbral.
- Exportar logs a un colector central (ELK / OpenSearch) para correlacionar eventos.
- Opcional: enviar métricas a un servicio gestionado (Grafana Cloud, Datadog) reutilizando /metrics/prometheus.
