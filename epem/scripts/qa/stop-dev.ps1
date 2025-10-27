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
