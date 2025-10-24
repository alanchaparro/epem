Param(
  [switch]$NoBootstrap,
  [string]$EnvFile = ".env.prod",
  [int]$TimeoutSec = 180
)

$ErrorActionPreference = 'Stop'

function Write-Info($m) { Write-Host "[deploy] $m" -ForegroundColor Cyan }
function Write-Ok($m)   { Write-Host "[deploy] $m" -ForegroundColor Green }
function Write-Warn($m) { Write-Warning "[deploy] $m" }
function Write-Err ($m) { Write-Host "[deploy] $m" -ForegroundColor Red }

function Test-Cmd($name) {
  try { $null = & $name --version 2>$null; return $true } catch { return $false }
}

function Wait-HttpOk([string]$Url, [int]$Timeout=60) {
  $deadline = (Get-Date).AddSeconds($Timeout)
  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 5 -ErrorAction Stop
      if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300) { return $true }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  return $false
}

Write-Info "Quickstart de despliegue (Compose)"

$repoRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
Set-Location $repoRoot

if (-not (Test-Cmd 'docker')) { Write-Err "Docker no está instalado o no está en PATH"; exit 1 }
if (-not (Test-Cmd 'docker-compose')) { Write-Info "Usando 'docker compose' (plugin)" }

if (-not (Test-Path $EnvFile)) {
  if (Test-Path '.env.prod.example') {
    Copy-Item '.env.prod.example' $EnvFile -Force
    Write-Warn "Se creó $EnvFile desde .env.prod.example. Revisa secretos/URLs (valores por defecto inseguros para prod)."
  } else {
    Write-Err "No existe $EnvFile ni .env.prod.example. Aborta."
    exit 1
  }
}

if (-not $NoBootstrap) {
  Write-Info "Bootstrap de BDs y seeds..."
  powershell -NoProfile -ExecutionPolicy Bypass -File 'ops/docker/bootstrap.ps1'
}

Write-Info "Levantando stack con Compose..."
docker compose --env-file $EnvFile up -d

Write-Info "Esperando servicios (gateway/web)..."
$okApi  = Wait-HttpOk 'http://localhost:4000/health'  -Timeout 90
$okWeb  = Wait-HttpOk 'http://localhost:8080/login'   -Timeout 90
if (-not $okApi) { Write-Err "Gateway no respondió 200 en /health" }
if (-not $okWeb) { Write-Err "Web no respondió 200 en /login" }

Write-Info "Ejecutando QA de smoke..."
$env:WEB_URL = 'http://localhost:8080'
node 'scripts/qa/test-back.js' | Out-Null
node 'scripts/qa/test-front.js' | Out-Null

$back = Get-Content 'docs/qa/back-report.md' -TotalCount 2 | Select-String 'Resultado' | ForEach-Object { $_.ToString() }
$front = Get-Content 'docs/qa/front-report.md' -TotalCount 2 | Select-String 'Resultado' | ForEach-Object { $_.ToString() }

$backPass = ($back -match 'PASS')
$frontPass = ($front -match 'PASS')

if ($backPass -and $frontPass) {
  Write-Ok "QA PASS. Web: http://localhost:8080  API: http://localhost:4000"
  exit 0
} else {
  Write-Err "QA FAIL. Revisa docs/qa/back-report.md y docs/qa/front-report.md"
  exit 2
}

