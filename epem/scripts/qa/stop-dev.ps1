param(
  [switch]$AlsoPorts
)

$ErrorActionPreference = 'SilentlyContinue'

function Write-Info([string]$m){ Write-Host "[stop-dev] $m" -ForegroundColor Cyan }
function Write-Ok([string]$m){ Write-Host "[stop-dev] $m" -ForegroundColor Green }
function Write-Warn([string]$m){ Write-Warning "[stop-dev] $m" }

$root = Resolve-Path "$PSScriptRoot/../.." | ForEach-Object { $_.Path }
$pidsFile = Join-Path $root '.tmp/dev-pids.json'

if (-not (Test-Path $pidsFile)) {
  Write-Warn "No pids file found at $pidsFile (nothing to kill)."
  # Fallback: matar procesos por puertos conocidos
  try {
    Write-Info 'Killing known service ports (fallback)'
    $ports = @(3000,3001,4000,3010,3020,3030,3040)
    foreach($p in $ports){
      try {
        $conns = Get-NetTCPConnection -LocalPort $p -ErrorAction Stop
        if ($conns) {
          $pids = $conns.OwningProcess | Sort-Object -Unique
          foreach ($pid in $pids) { try { Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue } catch {} }
        }
      } catch {
        $lines = netstat -ano | Select-String ":$p"
        foreach ($line in $lines) {
          $pid = ($line.ToString() -split '\s+')[-1]
          if ($pid -match '^[0-9]+$') { try { taskkill /PID $pid /F | Out-Null } catch {} }
        }
      }
    }
  } catch {}
} else {
  try {
    $json = Get-Content -Raw -Encoding UTF8 $pidsFile | ConvertFrom-Json
    $killed = @()
    foreach ($prop in $json.PSObject.Properties) {
      $name = $prop.Name
      $procId = [int]$prop.Value
      if ($procId -gt 0) {
        try { Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue; $killed += "$name=$procId" } catch {}
      }
    }
    if ($killed.Count -gt 0) { Write-Ok ("Stopped: {0}" -f ($killed -join ', ')) } else { Write-Warn 'No valid PIDs found.' }
  } catch {
    Write-Warn "Cannot read ${pidsFile}: $($_.Exception.Message)"
  }
  try { Remove-Item -Force $pidsFile } catch {}
}

if ($AlsoPorts) {
  Write-Info 'Freeing residual ports...'
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $root 'scripts/dev-reset.ps1') -NoStart
}

Write-Ok 'Stop done.'
