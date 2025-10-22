# QA Issues – EPEM (Fase 0/1)

Fecha: 2025-10-22

## Resumen
Se ejecutó una batería de pruebas de backend (scripts/qa/test-back.ps1). El reporte está en `docs/qa/back-report.md` y el resultado fue PASS en la última corrida. Se documentan hallazgos y riesgos detectados durante el proceso y en ejecuciones previas.

## Hallazgos de Funcionalidad

1. Crear paciente con DNI duplicado devuelve 500 (debería 409/400)
   - Estado: Corregido.
   - Detalle: se captura `P2002` en patients-service y se lanza `ConflictException` (409).
   - QA: test-back.ps1 valida "Crear paciente duplicado devuelve 409" → PASS.

2. Colisión de rutas en Next (HTML en lugar de JSON)
   - Contexto: fetch del front a `/patients?...` devolvía HTML de la página; el parser de JSON fallaba con `<!DOCTYPE...`.
   - Estado: Corregido. Ahora el front usa prefijo `/api/*` y se agregó rewrite genérico a gateway.
   - Recomendación: mantener todo acceso a datos por `/api/*` para evitar regresiones.

3. Alias `@` no resuelto en Next
   - Contexto: import '@/components/Nav' falló hasta configurar `baseUrl` + `paths` en tsconfig del web.
   - Estado: Corregido.

4. users-service se caía por uso de enums de Prisma en runtime
   - Contexto: `@IsEnum` con enum de Prisma provocaba `Cannot convert undefined or null to object` al boot.
   - Estado: Corregido al usar unión de strings + validación `IsIn`.

5. Cliente de Prisma compartido entre servicios
   - Contexto: el cliente de users-service colisionaba con otros generate del monorepo, provocando `prisma.user` indefinido.
   - Estado: Corregido. Se generó el cliente de users-service en `generated/client` y se actualizó el código para usarlo.

## Hallazgos de Operación / DevX

6. `pnpm dev:reset` se detenía por `netstat/findstr` (códigos de salida)
   - Estado: Corregido. Script robusto con `Get-NetTCPConnection` y reset de `$LASTEXITCODE`.

7. Prisma generate en Windows (EPERM rename en query_engine)
   - Contexto: antivirus/índice bloquea archivos bajo `node_modules/.prisma/client`.
   - Mitigación: cerrar node, borrar `node_modules/.prisma`, reintentar; considerar exclusión del antivirus.

8. CORS y cookies en producción
   - Recomendación: definir `CORS_ORIGIN` y `COOKIE_DOMAIN` en prod; cookie httpOnly ya es `secure` cuando `NODE_ENV=production`.

## Recomendaciones de Mejoras / Próximos pasos (Fase 2+)

- Patients-service: mapear `P2002` → 409 y estandarizar manejo de errores (problem+json).
- Gateway: añadir rate limiting básico para /auth y /patients.
- RBAC: aplicar guardas en endpoints que requieran rol (hoy /patients no exige token).
- QA Front: test end-to-end con Playwright/Cypress para validar toasts y flujos de UI.

## Evidencia
- Reporte backend: `docs/qa/back-report.md` (última ejecución PASS)
- Scripts de QA:
  - `scripts/qa/utils.ps1`
  - `scripts/qa/test-back.ps1`
  - `scripts/qa/test-front.ps1`
