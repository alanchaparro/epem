param(
  [switch]$NoStart
)
$ErrorActionPreference = 'SilentlyContinue'

function Kill-Port {
  param([int]$Port)
  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop
    if ($conns) {
      $pids = $conns.OwningProcess | Sort-Object -Unique
      foreach ($pid in $pids) { try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {} }
    }
  } catch {
    $lines = netstat -ano | Select-String ":$Port"
    foreach ($line in $lines) {
      $pid = ($line.ToString() -split '\s+')[-1]
      if ($pid -match '^[0-9]+$') { try { taskkill /PID $pid /F | Out-Null } catch {} }
    }
  }
}

# Intento reforzado: matar y esperar a que el puerto quede libre
function Ensure-Port-Free {
  param(
    [int]$Port,
    [int]$Retries = 6,
    [int]$DelayMs = 500
  )
  for ($i = 0; $i -lt $Retries; $i++) {
    try {
      $busy = $false
      try { $busy = (Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop).Count -gt 0 } catch { $busy = $false }
      if (-not $busy) { return $true }
      Kill-Port -Port $Port
    } catch {}
    Start-Sleep -Milliseconds $DelayMs
  }
  # Check final
  try { $busy = (Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop).Count -gt 0 } catch { $busy = $false }
  return (-not $busy)
}

# Puertos del stack
# 3000/3001 -> Next.js, 4000 -> Gateway, 3010/3020/3030/3040 -> microservicios NestJS
$ports = @(3000,3001,4000,3010,3020,3030,3040)
Write-Host "Cerrando procesos en puertos: $($ports -join ', ')" -ForegroundColor Cyan
foreach ($p in $ports) { Kill-Port -Port $p }

# Asegura que códigos de salida de findstr/netstat no corten el script
$global:LASTEXITCODE = 0

# Reintento reforzado de liberación
Write-Host "Verificando puertos libres..." -ForegroundColor Cyan
$stillBusy = @()
foreach ($p in $ports) {
  if (-not (Ensure-Port-Free -Port $p)) { $stillBusy += $p }
}
if ($stillBusy.Count -gt 0) {
  Write-Warning ("Puertos aún ocupados tras reintentos: {0}" -f ($stillBusy -join ', '))
}

if ($NoStart) {
  Write-Host "Puertos liberados. No se inicia pnpm dev porque se usó -NoStart." -ForegroundColor Yellow
  return
}

try {
  Write-Host "Inicializando .env local si falta..." -ForegroundColor Cyan
  node scripts/env-init.js | Out-Null
} catch {}

Write-Host "Levantando servicios y frontend (pnpm dev)" -ForegroundColor Green
pnpm -r --parallel --filter=./services/* --filter=@epem/web run dev
