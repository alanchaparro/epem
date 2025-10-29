param(
  [string]$Spec = 'tests/admin.spec.ts'
)

$ErrorActionPreference = 'Continue'
$env:E2E = 'true'
pnpm --filter @epem/web test:e2e -- $Spec

