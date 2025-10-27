param(
  [switch]$WithObs,
  [switch]$NoSeeds
)

$ErrorActionPreference = 'Continue'

function Info($m){ Write-Host "[compose-dev] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[compose-dev] $m" -ForegroundColor Green }
function Warn($m){ Write-Warning "[compose-dev] $m" }

function Wait-HttpOk([string]$url,[int]$timeoutSec=120){
  $deadline=(Get-Date).AddSeconds($timeoutSec)
  while((Get-Date) -lt $deadline){ try{ $r=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 5; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 300){ return $true } }catch{}; Start-Sleep -Milliseconds 500 }
  return $false
}

try { docker version | Out-Null } catch { Write-Error 'Docker Desktop no esta disponible. Abre Docker Desktop y reintenta.'; exit 1 }

if (-not (Test-Path '.env.prod')) { Info 'Inicializando .env.prod'; pnpm -s env:prod:init | Out-Null }

Info 'Levantando stack de desarrollo (compose)'
docker compose -f docker-compose.yml -f docker-compose.dev.yml --env-file .env.prod up -d mysql pnpm-install users-service patients-service catalog-service billing-service api-gateway web

Info 'Esperando health de gateway y web'
if (-not (Wait-HttpOk -url 'http://localhost:4000/health' -timeoutSec 180)) { Write-Error 'Gateway no respondio /health en tiempo'; exit 1 }
if (-not (Wait-HttpOk -url 'http://localhost:3000/login' -timeoutSec 180)) { Write-Error 'Web no respondio /login en tiempo'; exit 1 }

Info 'QA backend + frontend + DB'
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/run-all.ps1') -NoBootstrap | Out-Null
if ($WithObs) {
  Info 'Levantando observabilidad y corriendo QA de observabilidad'
  docker compose --env-file .env.prod up -d prometheus grafana | Out-Null
  node (Join-Path $PSScriptRoot 'qa/test-observability.js') | Out-Null
}

Info 'QA Gate'
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/require-pass.ps1')

