param(
  [switch]$NoSeeds,
  [switch]$SkipObservability
)

$ErrorActionPreference = 'Continue'

function Info($m){ Write-Host "[quickstart] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[quickstart] $m" -ForegroundColor Green }
function Warn($m){ Write-Warning "[quickstart] $m" }

function Wait-HttpOk([string]$url, [int]$timeoutSec=30){
  $deadline=(Get-Date).AddSeconds($timeoutSec)
  while((Get-Date) -lt $deadline){ try{ $r=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 5; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 300){ return $true } }catch{}; Start-Sleep -Milliseconds 500 }
  return $false
}

$needStart = $true
try {
  $gwOk = Wait-HttpOk 'http://localhost:4000/health' 3
  $webOk = Wait-HttpOk 'http://localhost:3000/login' 3
  if($gwOk -and $webOk){ $needStart = $false }
} catch {}

if ($needStart) {
  Info 'Levantando servicios y base de datos (con bootstrap)...'
  $args = @()
  if ($NoSeeds) { $args += '-NoSeeds' }
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/start-dev.ps1') @args
} else {
  Info 'Servicios ya responden (web/gateway). Continuando a QA...'
}

Info 'Ejecutando QA backend y frontend...'
$runAllArgs = @('-NoBootstrap')
if ($NoSeeds) { $runAllArgs += '-RunSeeds' } # si pidieron NoSeeds en start, no forzamos seeds aquí
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/run-all.ps1') @runAllArgs

if (-not $SkipObservability) {
  Info 'QA Observabilidad...'
  node (Join-Path $PSScriptRoot 'qa/test-observability.js') | Out-Null
}

Info 'QA Gate...'
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/require-pass.ps1')

