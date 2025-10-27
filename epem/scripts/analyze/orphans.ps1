param(
  [string]$ExtraArgs
)

$ErrorActionPreference = 'Continue'

$targets = @(
  'services/api-gateway/src',
  'services/billing-service/src',
  'services/catalog-service/src',
  'services/patients-service/src',
  'services/users-service/src',
  'apps/web/app',
  'apps/web/lib'
)

$exclude = 'node_modules|\\.next|/tests?/|\\.spec\\.ts$|/app/.*/(page|layout|loading|error)\\.tsx$|/middleware\\.ts$|/src/main\\.ts$'

$quotedTargets = $targets | ForEach-Object { '"' + $_ + '"' }
$argsList = @('--extensions','ts,tsx,js','--warning','--orphans','--exclude', '"' + $exclude + '"')
$argsList += $quotedTargets
if ($ExtraArgs) { $argsList += $ExtraArgs }

Write-Host "Running madge with excludes: $exclude" -ForegroundColor Cyan
$cmd = "npx --yes madge " + ($argsList -join ' ')
Write-Host $cmd -ForegroundColor DarkGray
Invoke-Expression $cmd
