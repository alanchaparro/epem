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

# Puertos del stack
# 3000/3001 -> Next.js, 4000 -> Gateway, 3010/3020/3030/3040 -> microservicios NestJS
$ports = @(3000,3001,4000,3010,3020,3030,3040)
Write-Host "Cerrando procesos en puertos: $($ports -join ', ')" -ForegroundColor Cyan
foreach ($p in $ports) { Kill-Port -Port $p }

# Asegura que códigos de salida de findstr/netstat no corten el script
$global:LASTEXITCODE = 0

if ($NoStart) {
  Write-Host "Puertos liberados. No se inicia pnpm dev porque se usó -NoStart." -ForegroundColor Yellow
  return
}

Write-Host "Levantando servicios y frontend (pnpm dev)" -ForegroundColor Green
pnpm -r --parallel --filter=./services/* --filter=@epem/web run dev
