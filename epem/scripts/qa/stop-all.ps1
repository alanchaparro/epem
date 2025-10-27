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

