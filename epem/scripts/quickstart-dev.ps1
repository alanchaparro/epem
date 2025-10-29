param(
  [switch]$NoSeeds,
  [switch]$SkipObservability
)

$ErrorActionPreference = 'Continue'

$RootDir = Split-Path -Parent $PSScriptRoot

function Info($m){ Write-Host "[quickstart] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[quickstart] $m" -ForegroundColor Green }
function Warn($m){ Write-Warning "[quickstart] $m" }

function Ensure-Command([string]$cmd, [string]$installHint){
  if (-not (Get-Command $cmd -ErrorAction SilentlyContinue)){
    Write-Error "No se encontró el comando '$cmd'. $installHint"; throw "Falta '$cmd'"
  }
}

function Run-Command([string]$label, [scriptblock]$action){
  Info $label
  & $action
  if ($LASTEXITCODE -ne 0){ throw "${label} falló (exit=$LASTEXITCODE)" }
  Ok "$label completado"
}

function Ensure-Pnpm{
  Ensure-Command 'pnpm' "Instala PNPM (https://pnpm.io/installation) y vuelve a ejecutar 'pnpm dev:one'."
}

function Ensure-EnvFile{
  $envFile = Join-Path $RootDir '.env'
  if (Test-Path $envFile){ return }
  Run-Command 'Inicializando .env (copiando desde .env.example)' { pnpm env:init }
  if (-not (Test-Path $envFile)){ throw 'No se pudo crear .env. Revisa permisos o ejecuta pnpm env:init manualmente.' }
}

function Ensure-Dependencies{
  $nm = Join-Path $RootDir 'node_modules'
  $lock = Join-Path $RootDir 'pnpm-lock.yaml'

  function Invoke-Install {
    param([switch]$Frozen)
    if ($Frozen) {
      Info 'Instalando dependencias (pnpm install --frozen-lockfile)'
      pnpm install --frozen-lockfile
      if ($LASTEXITCODE -ne 0) {
        Warn 'Install con --frozen-lockfile falló. Reintentando sin --frozen-lockfile...'
        pnpm install --no-frozen-lockfile
        if ($LASTEXITCODE -ne 0) { throw "Install falló (exit=$LASTEXITCODE)" }
      } else { Ok 'Instalando dependencias (pnpm install --frozen-lockfile) completado' }
    } else {
      Info 'Instalando dependencias (pnpm install)'
      pnpm install
      if ($LASTEXITCODE -ne 0) { throw "Install falló (exit=$LASTEXITCODE)" } else { Ok 'Instalando dependencias (pnpm install) completado' }
    }
  }

  if (-not (Test-Path $nm)){
    if (Test-Path $lock){ Invoke-Install -Frozen } else { Warn 'pnpm-lock.yaml no encontrado. Ejecutando install sin --frozen-lockfile.'; Invoke-Install }
    return
  }

  # Si node_modules existe, verificamos desincronización con el lockfile o árbol inconsistente
  $modulesYaml = Join-Path $nm '.modules.yaml'
  $needInstall = $false
  try {
    if ((Test-Path $lock) -and (Test-Path $modulesYaml)){
      $lockTime = (Get-Item $lock).LastWriteTimeUtc
      $modsTime = (Get-Item $modulesYaml).LastWriteTimeUtc
      if ($lockTime -gt $modsTime){ $needInstall = $true }
    }
  } catch {}

  if (-not $needInstall){
    try { pnpm list --depth -1 1>$null 2>$null } catch { $needInstall = $true }
  }

  if ($needInstall){ if (Test-Path $lock){ Invoke-Install -Frozen } else { Invoke-Install } }
}

Ensure-Pnpm
Ensure-EnvFile
Ensure-Dependencies

Info 'Limpiando servicios previos (stop-dev)...'
try {
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/stop-dev.ps1') -AlsoPorts | Out-Null
} catch {
  Warn "No se pudo ejecutar stop-dev: $($_.Exception.Message)"
}
$global:LASTEXITCODE = 0

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

# Siempre iniciamos en modo estable para garantizar QA, incluso si ya responden
$env:QA_STABLE_GATEWAY_BILLING = 'true'
# Forzar modo estable para TODOS los microservicios para evitar EADDRINUSE de ts-node-dev en Windows
$env:QA_STABLE_ALL = 'true'
if ($needStart) {
  Info 'Levantando servicios y base de datos (con bootstrap)...'
  $args = @()
  if ($NoSeeds) { $args += '-NoSeeds' }
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/start-dev.ps1') @args
} else {
  Info 'Servicios ya responden (web/gateway). Reiniciando en modo estable para QA...'
  try { powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/stop-dev.ps1') -AlsoPorts | Out-Null } catch {}
  $args = @('-NoBootstrap')
  if ($NoSeeds) { $args += '-NoSeeds' }
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/start-dev.ps1') @args
}

Info 'Ejecutando QA backend y frontend...'
$runAllArgs = @('-NoBootstrap')
if ($NoSeeds) { $runAllArgs += '-RunSeeds' } # si pidieron NoSeeds en start, no forzamos seeds aquí

# Primer intento de QA completo
$qaExit = 0
try {
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/run-all.ps1') @runAllArgs
  $qaExit = $LASTEXITCODE
} catch { $qaExit = 1 }

if ($qaExit -ne 0) {
  Warn 'QA falló en el primer intento. Esperando 30s y reintentando...'
  Start-Sleep -Seconds 30
  try {
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/run-all.ps1') @runAllArgs
    $qaExit = $LASTEXITCODE
  } catch { $qaExit = 1 }
}

if ($qaExit -ne 0) {
  Warn 'QA no pasó el gate tras reintento automático.'
  # Fallback automático: si Docker está disponible, intentamos stack Compose Dev completo
  try {
    docker version | Out-Null
    Warn 'Activando fallback Compose Dev (contenedores) para garantizar PASS...'
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/stop-dev.ps1') -AlsoPorts
    $composeArgs = @()
    if ($NoSeeds) { $composeArgs += '-NoSeeds' }
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'quickstart-compose-dev.ps1') @composeArgs
    return
  } catch {
    throw 'QA no pasó y Docker no está disponible para fallback. Revisa docs/qa/*-report.md'
  }
}

if (-not $SkipObservability) {
  Info 'QA Observabilidad...'
  node (Join-Path $PSScriptRoot 'qa/test-observability.js') | Out-Null
}

Info 'QA Gate...'
try {
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/require-pass.ps1')
  $gateExit = $LASTEXITCODE
} catch { $gateExit = 1 }

if ($gateExit -ne 0) {
  Warn 'QA Gate en FAIL. Intentando fallback Compose Dev para garantizar PASS...'
  try {
    docker version | Out-Null
    # detener cualquier resto y levantar compose-dev que ya ejecuta QA + gate
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'qa/stop-dev.ps1') -AlsoPorts | Out-Null
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'quickstart-compose-dev.ps1') @()
    return
  } catch {
    throw 'QA Gate en FAIL y Docker Compose no disponible para fallback. Revisa docs/qa/*-report.md'
  }
}
