param(
  [switch]$WithObs,
  [switch]$NoSeeds
)

$ErrorActionPreference = 'Continue'

function Info($m){ Write-Host "[dev:docker] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[dev:docker] $m" -ForegroundColor Green }
function Warn($m){ Write-Warning "[dev:docker] $m" }

function Wait-HealthHttp([string]$url,[int]$timeoutSec=120){
  $deadline=(Get-Date).AddSeconds($timeoutSec)
  while((Get-Date) -lt $deadline){ try{ $r=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 5; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 300){ return $true } }catch{}; Start-Sleep -Milliseconds 500 }
  return $false
}

# 1) Docker engine check
try { docker version | Out-Null } catch { Write-Error 'Docker Desktop no esta disponible. Abre Docker Desktop y reintenta.'; exit 1 }

# 2) Ensure .env.prod (compose uses it)
if (-not (Test-Path (Join-Path $PSScriptRoot '../.env.prod'))) {
  Info 'Inicializando .env.prod (si falta)'
  pushd (Resolve-Path (Join-Path $PSScriptRoot '..'))
  try { pnpm -s env:prod:init | Out-Null } catch {}
  popd
}

# 3) Up minimal infra (MySQL) and optional observability
pushd (Resolve-Path (Join-Path $PSScriptRoot '..'))
Info 'Levantando MySQL (Docker Compose)'
docker compose --env-file .env.prod up -d mysql | Out-Null
if ($WithObs) {
  Info 'Levantando Prometheus + Grafana'
  docker compose --env-file .env.prod up -d prometheus grafana | Out-Null
}
popd

Info 'Esperando MySQL (3306)'
Start-Sleep -Seconds 8

# 4) Start local services + web with bootstrap
$startArgs = @()
if ($NoSeeds) { $startArgs += '-NoSeeds' }
Info 'Levantando servicios locales con bootstrap'
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/start-dev.ps1') @startArgs

# 5) QA (backend + frontend + DB) y gate
Info 'QA backend + frontend + DB'
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/run-all.ps1') -NoBootstrap | Out-Null
if ($WithObs) {
  Info 'QA observabilidad'
  node (Join-Path $PSScriptRoot 'qa/test-observability.js') | Out-Null
}
Info 'QA Gate'
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/require-pass.ps1')

