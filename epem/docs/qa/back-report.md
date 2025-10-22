# QA Report
Resultado: "PASS"

- [PASS] Gateway /health responde - expected: True actual: http://localhost:4000/health
- [PASS] Users-service /api/health responde - expected: True actual: http://localhost:3020/api/health
- [PASS] Patients-service /health responde - expected: True actual: http://localhost:3010/health
- [PASS] Login devuelve accessToken - expected: True actual: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NGVhYTU1Zi0xMjFjLTQ1MGUtYTdlMi1jNDE1NDA2N2NhMTgiLCJlbWFpbCI6ImFkbWluQGVwZW0ubG9jYWwiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjExNzUwODcsImV4cCI6MTc2MTE3NTk4N30.4kgiuk3nzGegQRnG4OiaWau2qLO_uWALvldpuycVIVg
- [PASS] Perfil /users/me email coincide - expected: admin@epem.local actual: admin@epem.local
- [PASS] Listado de pacientes devuelve items - expected: True actual: 5
- [PASS] Crear paciente devuelve id - expected: True actual: 67aa52eb-30a5-4ff9-a3d7-c55dee276cfe
- [PASS] Patch de paciente actualiza phone - expected: 11-0000-0000 actual: 11-0000-0000
- [PASS] Crear paciente duplicado devuelve 409 - expected: 409 actual: 409
- [PASS] Catalog-service /health responde - expected: True actual: True
- [PASS] Crear prestaciÃ³n devuelve id - expected: True actual: a2d0ce62-1780-4a00-9c74-0806fcd58290
- [PASS] Editar prestaciÃ³n actualiza nombre - expected: Prestacion QA Edit actual: Prestacion QA Edit
- [PASS] Crear prestaciÃ³n duplicada devuelve 409 - expected: 409 actual: 409
