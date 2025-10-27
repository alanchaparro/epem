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

$argsList = @('--extensions','ts,tsx,js','--warning','--circular')
$argsList += ($targets | ForEach-Object { '"' + $_ + '"' })
if ($ExtraArgs) { $argsList += $ExtraArgs }

$cmd = "npx --yes madge " + ($argsList -join ' ')
Write-Host $cmd -ForegroundColor DarkGray
Invoke-Expression $cmd

