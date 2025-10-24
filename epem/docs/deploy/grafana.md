# Grafana: Dashboards y Alertas

## Dashboards

Para importar los dashboards de Grafana:

1.  Navigate to the Grafana UI.
2.  Go to the "+" icon on the left sidebar and select "Import".
3.  Copia/Importa los JSON desde los siguientes archivos:
    *   `ops/grafana/dashboard-api.json` (tráfico HTTP por servicio/ruta)
    *   `ops/grafana/dashboard-services.json` (estado general por servicio)
    *   `ops/grafana/dashboard-observability.json` (panel integral de observabilidad)
    *   `ops/grafana/dashboard-smoke.json` (smoke básico)
4.  Click "Load".
5.  Select the Prometheus data source and click "Import".

Los cuatro dashboards están listos para importar; úsalo según el nivel de detalle que necesites.

## Alerts

Las alertas canónicas viven en `ops/prometheus/alerts.yml` y se cargan desde `ops/prometheus/prometheus.yml` (clave `rule_files`). Si prefieres gestionarlas desde Grafana Alerting, configura un Contact point y crea reglas equivalentes ahí.

### Reglas incluidas

*   **LatencyHigh**: p95 > 1s por 5 minutos.
*   **ErrorRateHigh**: más de 5 respuestas 5xx/min.

### Configuración

1. Configura el data source Prometheus en Grafana (URL: `http://prometheus:9090`).
2. Crea un Contact point (Email/Slack/etc.) y rutas de notificación.
3. Prometheus cargará automáticamente `ops/prometheus/alerts.yml` si está referenciado en `prometheus.yml` (ya incluido en este repo).
