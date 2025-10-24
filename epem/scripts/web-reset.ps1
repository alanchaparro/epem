Param(
  [switch]$Detached,
  [int]$WaitSeconds = 30
)
$ErrorActionPreference = 'Stop'

Write-Host "[web:reset] Cleaning web dev environment..."

$root = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$webPath = Join-Path $root 'apps/web'
$nextCache = Join-Path $webPath '.next'

try {
  # Kill port 3000 if busy (best-effort)
  $kill = Join-Path $PSScriptRoot 'tools/kill-ports.ps1'
  if (Test-Path $kill) {
    & $kill -Ports 3000 | Out-Null
  }
} catch {
  Write-Warning "Kill ports failed: $($_.Exception.Message)"
}

# Fix potential BOM/encoding issues in root package.json (causes Next parse errors)
try {
  $pkg = Join-Path $root 'package.json'
  if (Test-Path $pkg) {
    $bytes = [System.IO.File]::ReadAllBytes($pkg)
    $hadBom = $false
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
      $content = [System.Text.UTF8Encoding]::UTF8.GetString($bytes,3,$bytes.Length-3)
      [System.IO.File]::WriteAllText($pkg,$content,[System.Text.UTF8Encoding]::new($false))
      $hadBom = $true
    }
    # Also handle leading U+FEFF if present
    $text = Get-Content -Raw $pkg
    if ($text.StartsWith([char]0xFEFF)) {
      $text = $text.TrimStart([char]0xFEFF)
      [System.IO.File]::WriteAllText($pkg,$text,[System.Text.UTF8Encoding]::new($false))
      $hadBom = $true
    }
    if ($hadBom) { Write-Host "[web:reset] package.json: BOM removido y regrabado en UTF-8 sin BOM" -ForegroundColor Yellow }
    # Validate JSON
    try { $null = Get-Content -Raw $pkg | ConvertFrom-Json } catch {
      Write-Warning "[web:reset] package.json inválido. Intentando regrabar como UTF-8 sin BOM..."
      $txt2 = Get-Content -Raw $pkg
      [System.IO.File]::WriteAllText($pkg,$txt2,[System.Text.UTF8Encoding]::new($false))
      try { $null = Get-Content -Raw $pkg | ConvertFrom-Json } catch {
        Write-Error "package.json sigue inválido. Revisa formato JSON en $pkg"; throw
      }
    }
  }
} catch {
  Write-Warning "[web:reset] No se pudo normalizar package.json: $($_.Exception.Message)"
}

try {
  if (Test-Path $nextCache) {
    Write-Host "[web:reset] Removing $nextCache"
    Remove-Item -Recurse -Force $nextCache
  }
} catch {
  Write-Warning "Failed to remove .next cache: $($_.Exception.Message)"
}

Write-Host "[web:reset] Starting Next.js dev server (@epem/web)"
if ($Detached) {
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = "pnpm"
  $psi.Arguments = "--filter @epem/web run dev"
  $psi.WorkingDirectory = $root
  $psi.UseShellExecute = $false
  $proc = [System.Diagnostics.Process]::Start($psi)
  Write-Host "[web:reset] Dev server iniciado (PID=$($proc.Id)). Verificando /login..."
  $deadline = (Get-Date).AddSeconds($WaitSeconds)
  $ok = $false
  while ((Get-Date) -lt $deadline) {
    try {
      $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000/login' -TimeoutSec 3 -ErrorAction Stop
      if ($r.StatusCode -eq 200) { $ok = $true; break }
    } catch {}
    Start-Sleep -Milliseconds 500
  }
  if ($ok) { Write-Host "[web:reset] OK: /login respondió 200" -ForegroundColor Green }
  else { Write-Warning "[web:reset] Timeout esperando 200 en /login ($WaitSeconds s)" }
} else {
  Set-Location $root
  pnpm --filter @epem/web run dev
}
