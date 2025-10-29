/* Lightweight OpenTelemetry bootstrap. Safe no-op when OTEL_ENABLED != 'true'. */
/* eslint-disable @typescript-eslint/no-var-requires */
export function initOtel() {
  try {
    if (process.env.OTEL_ENABLED !== 'true') return;
    // dynamic imports to keep cold start small when disabled
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');
    const { Resource } = require('@opentelemetry/resources');
    const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
    const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');

    const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318/v1/traces';
    const exporter = new OTLPTraceExporter({ url: endpoint });
    const serviceName = process.env.SERVICE_NAME || 'api-gateway';
    const sdk = new NodeSDK({
      traceExporter: exporter,
      resource: new Resource({ [SemanticResourceAttributes.SERVICE_NAME]: serviceName }),
      instrumentations: [getNodeAutoInstrumentations()],
    });
    sdk.start();
    // no sdk.stop() here; process handles SIGTERM in container runtime
  } catch (e) {
    // Swallow OTEL init errors to avoid impacting the app
    // eslint-disable-next-line no-console
    console.warn('[otel] init skipped or failed:', (e as Error).message);
  }
}

// Auto-init on import
initOtel();

