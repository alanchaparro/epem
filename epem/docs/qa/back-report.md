# QA Report
Resultado: "PASS"

- [PASS] Gateway /health responde - expected: True actual: http://localhost:4000/health
- [PASS] Users-service /api/health responde - expected: True actual: http://localhost:3020/api/health
- [PASS] Patients-service /health responde - expected: True actual: http://localhost:3010/health
- [PASS] Login devuelve accessToken - expected: True actual: [REDACTED]
- [PASS] Perfil /users/me email coincide - expected: admin@epem.local actual: admin@epem.local
- [PASS] Listado de pacientes devuelve items - expected: True actual: 5
- [PASS] Crear paciente devuelve id - expected: True actual: 738218ec-61b9-4683-a299-7623cef6de68
- [PASS] Patch de paciente actualiza phone - expected: 11-0000-0000 actual: 11-0000-0000
- [PASS] Crear paciente duplicado devuelve 409 - expected: 409 actual: 409
- [PASS] Catalog-service /health responde - expected: True actual: True
- [PASS] Crear prestaciÃ³n devuelve id - expected: True actual: eb56f240-fd06-43cf-9f3a-48dab2577bcc
- [PASS] Editar prestaciÃ³n actualiza nombre - expected: Prestacion QA Edit actual: Prestacion QA Edit
- [PASS] Crear prestaciÃ³n duplicada devuelve 409 - expected: 409 actual: 409
