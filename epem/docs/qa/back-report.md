# QA Report
Resultado: "PASS"

- [PASS] Gateway /health responde - expected: True actual: http://localhost:4000/health
- [PASS] Users-service /api/health responde - expected: True actual: http://localhost:3020/api/health
- [PASS] Patients-service /health responde - expected: True actual: http://localhost:3010/health
- [PASS] Login devuelve accessToken - expected: True actual: [REDACTED]
- [PASS] Perfil /users/me email coincide - expected: admin@epem.local actual: admin@epem.local
- [PASS] Listado de pacientes devuelve items - expected: True actual: 1
- [PASS] Crear paciente devuelve id - expected: True actual: 0c86ce72-430c-4a3b-8db9-8a406e687354
- [PASS] Patch de paciente actualiza phone - expected: 11-0000-0000 actual: 11-0000-0000
- [PASS] Crear paciente duplicado devuelve 409 - expected: 409 actual: 409
- [PASS] Catalog-service /health responde - expected: True actual: True
- [PASS] Crear prestaciÃ³n devuelve id - expected: True actual: ccc40d42-bb12-4ca3-a9cd-594cff65b91f
- [PASS] Editar prestaciÃ³n actualiza nombre - expected: Prestacion QA Edit actual: Prestacion QA Edit
- [PASS] Crear prestaciÃ³n duplicada devuelve 409 - expected: 409 actual: 409
- [PASS] Billing-service /health responde - expected: True actual: True
- [PASS] Crear aseguradora devuelve id - expected: True actual: 3709a0bd-dddf-452f-bb66-2be53196c6a0
- [PASS] Actualizar aseguradora cambia active - expected: True actual: False
- [PASS] Listado de coberturas responde - expected: True actual: 0
- [PASS] Crear cobertura devuelve id - expected: True actual: 13b2b95a-e5bf-4139-8044-4a1e37ed99d2
- [PASS] Editar cobertura actualiza copago - expected: 500 actual: 500
- [PASS] Editar cobertura actualiza requiresAuth - expected: True actual: False
