param(
  [switch]$WithObs,
  [switch]$NoSeeds
)

$ErrorActionPreference = 'Stop'

function Info($m){ Write-Host "[assure] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[assure] $m" -ForegroundColor Green }
function Warn($m){ Write-Warning "[assure] $m" }
function Fail($m){ Write-Error "[assure] $m" }

Info 'Iniciando aseguramiento end-to-end (backend + frontend + DB)'

$argsDev = @()
if ($NoSeeds) { $argsDev += '-NoSeeds' }
if (-not $WithObs) { $argsDev += '-SkipObservability' }

$devExit = $null
try {
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot '../quickstart-dev.ps1') @argsDev
  $devExit = $LASTEXITCODE
} catch {
  $devExit = 1
}

if ($devExit -eq 0) {
  Ok 'QA Gate: PASS (dev)'
  exit 0
}

Warn "Quickstart dev falló (exit $devExit)."

Warn 'Intentando fallback Compose Dev (contenedores)'
$argsCompose = @()
if ($NoSeeds) { $argsCompose += '-NoSeeds' }
if (-not $WithObs) { $argsCompose += '' } else { $argsCompose += '-WithObs' }

powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot '../quickstart-compose-dev.ps1') @argsCompose
$composeExit = $LASTEXITCODE
if ($composeExit -eq 0) {
  Ok 'QA Gate: PASS (compose)'
  exit 0
}

Fail "QA Gate: FAIL incluso en fallback. Revisa docs/qa/*-report.md"
exit 1
