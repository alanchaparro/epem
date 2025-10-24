## Resumen

Describe brevemente el objetivo del PR y el problema que resuelve.

## Cambios

- [ ] Backend: optimizaciones/ajustes
- [ ] Frontend: hooks/tipos/refactors
- [ ] QA/Tooling: scripts/CI
- [ ] Docs: README / deploy / observability / módulos
- [ ] Actualicé CHANGELOG.md con los cambios relevantes

## QA

- [ ] `scripts/qa/run-all.ps1` → PASS
- [ ] `node scripts/qa/test-back.js` → PASS
- [ ] `node scripts/qa/test-front.js` → PASS
- [ ] DB verificada (`docs/qa/db-report.md`)

## Checklist

- [ ] Tests/lint pasan localmente
- [ ] Actualicé documentación si aplica
- [ ] No hay secretos ni datos sensibles en los cambios
- [ ] Compatible con despliegue en VPS (variables .env completas)

## Riesgos / Notas

¿Hay breaking changes, migraciones o tareas post-deploy?
