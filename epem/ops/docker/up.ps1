Param(
  [string]$EnvFile = ".env.prod",
  [int]$TimeoutSec = 180
)
$ErrorActionPreference = 'Stop'
function Info($m){ Write-Host "[docker:up] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[docker:up] $m" -ForegroundColor Green }
function Warn($m){ Write-Warning "[docker:up] $m" }

Info "Levantar stack (compose) con $EnvFile"
docker compose --env-file $EnvFile up -d

function Wait-Ok([string]$Url,[int]$Timeout=60){
  $deadline=(Get-Date).AddSeconds($Timeout)
  while((Get-Date) -lt $deadline){
    try {$r=Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 5 -ErrorAction Stop; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 300){return $true}}catch{}
    Start-Sleep -Milliseconds 500
  }
  return $false
}

Info "Esperando Gateway (4000) y Web (8080)..."
$okApi = Wait-Ok 'http://localhost:4000/health' 120
$okWeb = Wait-Ok 'http://localhost:8080/login' 120
if(-not $okApi){ Warn "Gateway no respondió 200" }
if(-not $okWeb){ Warn "Web no respondió 200" }

Ok "Listo. Usa pnpm deploy:check para QA rápido."

