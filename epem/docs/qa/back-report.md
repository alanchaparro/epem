# QA Report
Resultado: "FAIL"

- [PASS] Gateway /health responde - expected: true actual: http://localhost:4000/health
- [PASS] Users-service /api/health responde - expected: true actual: http://localhost:3020/api/health
- [FAIL] Patients-service /health responde - expected: true actual: http://localhost:3010/health
- [PASS] Login devuelve accessToken - expected: true actual: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5NGVhYTU1Zi0xMjFjLTQ1MGUtYTdlMi1jNDE1NDA2N2NhMTgiLCJlbWFpbCI6ImFkbWluQGVwZW0ubG9jYWwiLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3NjEzMzk4MTUsImV4cCI6MTc2MTM0MDcxNX0.pdoPRBuj2AjL_IZuggzgkg8dXrz4jzVUB4LCYwhSPQA
- [PASS] Perfil /users/me email coincide - expected: admin@epem.local actual: admin@epem.local
- [FAIL] Listado de pacientes devuelve items - expected: true actual: status=500
- [FAIL] Crear paciente devuelve id - expected: true actual: status=500
- [FAIL] Crear paciente duplicado devuelve 409 - expected: 409 actual: 500
- [FAIL] Catalog-service /health responde - expected: true actual: false