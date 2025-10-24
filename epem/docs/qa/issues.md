# QA Issues - EPEM (Fase 8)

Fecha: 2025-10-24

## Resumen
Ultima ejecucion de QA (2025-10-24):
- Backend: PASS -> ver docs/qa/back-report.md
- Frontend: PASS -> ver docs/qa/front-report.md
- Base de datos: PASS -> ver docs/qa/db-report.md
- Gate QA: PASS -> ver salida de scripts/qa/require-pass.ps1

No hay hallazgos abiertos; se puede avanzar a la siguiente fase.

## Protocolo y Responsables
- Duenos de resolucion:
  - Arquitecto: temas cross-servicio (gateway, CORS, errores estandar, rutas /api, seguridad).
  - Ingeniero (DevOps): disponibilidad de servicios, scripts dev:reset, Prisma generate/push, pipelines.
  - Desarrollador: correcciones especificas por modulo (frontend/web y cada microservicio).
- Flujo de trabajo:
  1) QA registra hallazgos aqui con Estado/Severidad/Owner.
  2) Owner toma el issue, implementa fix y referencia commit/PR.
  3) QA re-ejecuta scripts y marca PASS en reportes.
  4) Roles completan docs/qa/sign-off.md con OK final para pasar de fase.

## Hallazgos de Disponibilidad (Ejecucion actual)

- Servicios disponibles durante QA
  - Estado: Corregido (health de gateway, users, patients, catalog y billing responden 200).
  - Severidad: Alta
  - Owner: Ingeniero
  - Accion: mantener pnpm dev:reset en ejecucion durante QA; sin pendientes.

## Hallazgos de Funcionalidad

1. Crear paciente con DNI duplicado devuelve 500 (deberia 409/400)
   - Estado: Corregido.
   - Severidad: Alta
   - Owner: Desarrollador (patients-service)
   - Detalle: se captura P2002 en patients-service y se lanza ConflictException (409).
   - QA: test-back.ps1 valida "Crear paciente duplicado devuelve 409" -> PASS.

2. Colision de rutas en Next (HTML en lugar de JSON)
   - Contexto: fetch del front a /patients?... devolvia HTML de la pagina; el parser de JSON fallaba con <!DOCTYPE....
   - Estado: Corregido. Ahora el front usa prefijo /api/* y se agrego rewrite generico a gateway.
   - Severidad: Media
   - Owner: Arquitecto + Desarrollador Frontend
   - Recomendacion: mantener todo acceso a datos por /api/* para evitar regresiones.

3. Alias @ no resuelto en Next
   - Contexto: import '@/components/Nav' fallo hasta configurar aseUrl + paths en tsconfig del web.
   - Estado: Corregido.
   - Severidad: Baja
   - Owner: Desarrollador Frontend

4. users-service se caia por uso de enums de Prisma en runtime
   - Contexto: @IsEnum con enum de Prisma provocaba Cannot convert undefined or null to object al boot.
   - Estado: Corregido al usar union de strings + validacion IsIn.
   - Severidad: Alta
   - Owner: Desarrollador (users-service)

5. Cliente de Prisma compartido entre servicios
   - Contexto: el cliente de users-service colisionaba con otros generate del monorepo, provocando prisma.user indefinido.
   - Estado: Corregido. Se genero el cliente de users-service en generated/client y se actualizo el codigo para usarlo.
   - Severidad: Media
   - Owner: Arquitecto / Ingeniero

## Hallazgos de Operacion / DevX

6. pnpm dev:reset se detenia por 
etstat/findstr (codigos de salida)
   - Estado: Corregido. Script robusto con Get-NetTCPConnection y reset de $LASTEXITCODE.
   - Severidad: Media
   - Owner: Ingeniero

7. Prisma generate en Windows (EPERM rename en query_engine)
   - Contexto: antivirus/indice bloquea archivos bajo 
ode_modules/.prisma/client.
   - Mitigacion: cerrar node, borrar 
ode_modules/.prisma, reintentar; considerar exclusion del antivirus.
   - Severidad: Media
   - Owner: Ingeniero

8. CORS y cookies en produccion
   - Recomendacion: definir CORS_ORIGIN y COOKIE_DOMAIN en prod; cookie httpOnly ya es secure cuando NODE_ENV=production.
   - Severidad: Media
   - Owner: Arquitecto

## Hallazgos de Base de Datos

9. Falta base de datos de catalogo epem_catalog y tabla ServiceItem
   - Evidencia: captura local del usuario muestra solo epem y epem_users.
   - Estado: Corregido (bootstrap creo BD y tabla; DB QA PASS).
   - Severidad: Media
   - Owner: Ingeniero
   - Siguiente accion: sin accion. Monitorear en VPS.

## Recomendaciones de Mejoras / Proximos pasos (Fase 2+)

- Patients-service: mapear P2002 -> 409 y estandarizar manejo de errores (problem+json).
- Gateway: anadir rate limiting basico para /auth y /patients.
- RBAC: aplicar guardas en endpoints que requieran rol (hoy /patients no exige token).
- QA Front: test end-to-end con Playwright/Cypress para validar toasts y flujos de UI.

- Reporte backend: docs/qa/back-report.md
- Reporte frontend: docs/qa/front-report.md
- Reporte base de datos: docs/qa/db-report.md
- Scripts de QA:
  - scripts/qa/utils.ps1
  - scripts/qa/test-back.ps1
  - scripts/qa/test-front.ps1

## Ejecucion local / QA
  - Preparacion
    - pnpm install
    - scripts/tools/kill-ports.ps1 ó pnpm dev:reset -NoStart (libera puertos antes de arrancar)
    - pnpm dev:reset (levanta backend + web)
  - Opcional: pnpm --filter @epem/users-service prisma:generate y pnpm --filter @epem/patients-service prisma:generate
- Seeds: pnpm --filter @epem/users-service seed:admin, pnpm --filter @epem/patients-service seed:patients, pnpm --filter @epem/catalog-service seed:items, pnpm --filter @epem/billing-service seed:insurers
  - QA Backend
    - PowerShell: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/qa/test-back.ps1
    - Resultados: docs/qa/back-report.md y docs/qa/back-results.json
  - QA Front (opcional)
    - PowerShell: powershell -NoProfile -ExecutionPolicy Bypass -File scripts/qa/test-front.ps1
    - Resultados: docs/qa/front-report.md y docs/qa/front-results.json
  - QA Full
    - `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/qa/run-all.ps1 [-RunSeeds] [-SkipFront]`

## OK de QA / Gate de Fase
- Completar docs/qa/sign-off.md con los tres OK (Arquitecto, Ingeniero, Desarrollador) una vez que:
  - docs/qa/back-report.md indique Resultado: "PASS".
  - docs/qa/front-report.md (si aplica) indique Resultado: "PASS".
  - docs/qa/db-report.md indique Resultado: "PASS".
- Alternativamente, ejecutar scripts/qa/require-pass.ps1 para validar automaticamente el gate (retorna codigo 0/1).
