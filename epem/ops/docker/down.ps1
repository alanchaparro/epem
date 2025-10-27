Param([switch]$Volumes)
$ErrorActionPreference = 'Stop'
Write-Host "[docker:down] Deteniendo stack..." -ForegroundColor Cyan
if($Volumes){ docker compose down -v } else { docker compose down }
Write-Host "[docker:down] OK." -ForegroundColor Green

