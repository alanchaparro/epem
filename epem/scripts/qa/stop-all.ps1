param(
  [switch]$NoDocker
)

$ErrorActionPreference = 'Continue'

function Info($m){ Write-Host "[stop-all] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[stop-all] $m" -ForegroundColor Green }
function Warn($m){ Write-Warning "[stop-all] $m" }

$root = Resolve-Path "$PSScriptRoot/../.." | ForEach-Object { $_.Path }

Info 'Stopping dev processes by PIDs and freeing ports...'
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root 'scripts/qa/stop-dev.ps1') -AlsoPorts

# Deep kill for stubborn ports (Next.js 3000, Gateway 4000, services 3010-3040)
try {
  Info 'Force-killing port owners (deep)...'
  $ports = @(3000,4000,3010,3020,3030,3040)
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root 'scripts/tools/kill-ports-deep.ps1') -Ports $ports
  $left = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue | Where-Object { $_.LocalPort -in $ports } | Select-Object -ExpandProperty LocalPort -Unique
  if($left){
    Warn ("ports still busy: {0}. Killing common dev processes (node, pnpm)..." -f ($left -join ', '))
    try { & taskkill /IM node.exe /F /T | Out-Null } catch {}
    try { & taskkill /IM pnpm.exe /F /T | Out-Null } catch {}
  }
} catch { Warn "deep kill failed: $($_.Exception.Message)" }

if (-not $NoDocker) {
  try {
    Info 'Bringing docker compose down (if running)...'
    powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root 'ops/docker/down.ps1')
  } catch { Warn "docker down failed or not available: $($_.Exception.Message)" }
}

Info 'Stopping local MySQL processes if active...'
try { Stop-Process -Name 'mysqld' -Force -ErrorAction SilentlyContinue } catch {}
try { Stop-Process -Name 'mysql' -Force -ErrorAction SilentlyContinue } catch {}
try {
  $svcs = Get-Service *mysql* -ErrorAction SilentlyContinue
  foreach($s in $svcs){ if($s.Status -ne 'Stopped'){ try { Stop-Service -Name $s.Name -Force -ErrorAction SilentlyContinue } catch {} } }
} catch {}

Ok 'Stop all done.'
