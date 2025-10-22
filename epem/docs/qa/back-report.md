# QA Report
Resultado: "PASS"

- [PASS] Gateway /health responde - expected: True actual: http://localhost:4000/health
- [PASS] Users-service /api/health responde - expected: True actual: http://localhost:3020/api/health
- [PASS] Patients-service /health responde - expected: True actual: http://localhost:3010/health
- [PASS] Login devuelve accessToken - expected: True actual: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NGVhYTU1Zi0xMjFjLTQ1MGUtYTdlMi1jNDE1NDA2N2NhMTgiLCJlbWFpbCI6ImFkbWluQGVwZW0ubG9jYWwiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjExNTEwNDAsImV4cCI6MTc2MTE1MTk0MH0.pQgu1kciW-6YI84fYniJfaJp8Ln0J1Tn9qOV2Wpc0GY
- [PASS] Perfil /users/me email coincide - expected: admin@epem.local actual: admin@epem.local
- [PASS] Listado de pacientes devuelve items - expected: True actual: 1
- [PASS] Crear paciente devuelve id - expected: True actual: 4b643e14-7543-48e0-8e9c-59a6d3e01d23
- [PASS] Patch de paciente actualiza phone - expected: 11-0000-0000 actual: 11-0000-0000
- [PASS] Crear paciente duplicado devuelve 409 - expected: 409 actual: 409
