param([switch]$SkipFront, [switch]$NoBootstrap)

if (-not $NoBootstrap) {
  Write-Host 'QA: Preparando BDs/tablas (bootstrap)...' -ForegroundColor Cyan
  powershell -NoProfile -ExecutionPolicy Bypass -File "$PSScriptRoot/bootstrap.ps1" -NoSeeds
}

Write-Host 'QA: Ejecutando backend...' -ForegroundColor Cyan
powershell -NoProfile -ExecutionPolicy Bypass -File "$PSScriptRoot/test-back.ps1"

if (-not $SkipFront) {
  Write-Host 'QA: Ejecutando frontend...' -ForegroundColor Cyan
  powershell -NoProfile -ExecutionPolicy Bypass -File "$PSScriptRoot/test-front.ps1"
}

Write-Host 'QA: Verificando base de datos...' -ForegroundColor Cyan
powershell -NoProfile -ExecutionPolicy Bypass -File "$PSScriptRoot/check-db.ps1"

Write-Host 'QA: Validando gate...' -ForegroundColor Cyan
powershell -NoProfile -ExecutionPolicy Bypass -File "$PSScriptRoot/require-pass.ps1" @(@{SkipFront=$SkipFront}['SkipFront'])
