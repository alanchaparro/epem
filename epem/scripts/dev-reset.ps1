$ErrorActionPreference = 'SilentlyContinue'

# Puertos del stack
$ports = @(3000,3001,4000,3010,3020,3030,3040)

Write-Host "Cerrando procesos en puertos: $($ports -join ', ')" -ForegroundColor Cyan
foreach ($p in $ports) {
  netstat -ano | findstr ":$p" | ForEach-Object {
    $pid = ($_ -split '\s+')[-1]
    if ($pid -match '^[0-9]+$') {
      try { taskkill /PID $pid /F | Out-Null } catch {}
    }
  }
}

Write-Host "Levantando servicios y frontend (pnpm dev)" -ForegroundColor Green
pnpm -r --parallel --filter=./services/* --filter=@epem/web run dev
