param(
  [switch]$NoBootstrap,
  [switch]$NoSeeds,
  [int]$TimeoutSec = 120
)

$ErrorActionPreference = 'Continue'

function Write-Info([string]$m){ Write-Host "[start-dev] $m" -ForegroundColor Cyan }
function Write-Ok([string]$m){ Write-Host "[start-dev] $m" -ForegroundColor Green }
function Write-Warn([string]$m){ Write-Warning "[start-dev] $m" }

function Test-TcpPortOpen([string]$host, [int]$port, [int]$timeoutMs=1000){
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect($host, $port, $null, $null)
    if($iar.AsyncWaitHandle.WaitOne($timeoutMs, $false)){
      $client.EndConnect($iar); $client.Close(); return $true
    }
    $client.Close(); return $false
  } catch { return $false }
}

function Ensure-MySql {
  if (Test-TcpPortOpen -host '127.0.0.1' -port 3306 -timeoutMs 800) { Write-Ok 'MySQL already listening on 127.0.0.1:3306'; return }
  $mysqlAdmin = $null
  $candidates = @('C:\\xampp\\mysql\\bin\\mysqladmin.exe','mysqladmin')
  foreach ($c in $candidates) {
    if ($c -eq 'mysqladmin') { if (Get-Command mysqladmin -ErrorAction SilentlyContinue) { $mysqlAdmin = 'mysqladmin'; break } }
    elseif (Test-Path $c) { $mysqlAdmin = $c; break }
  }
  if ($mysqlAdmin) {
    try {
      & $mysqlAdmin -uroot -h 127.0.0.1 ping 2>$null | Out-Null
      if ($LASTEXITCODE -eq 0) { Write-Ok 'MySQL responds to mysqladmin'; return }
    } catch {}
  }

  $mysqld = 'C:\\xampp\\mysql\\bin\\mysqld.exe'
  if (Test-Path $mysqld) {
    Write-Info 'Starting MySQL (XAMPP) in background...'
    Start-Process -FilePath $mysqld -ArgumentList '--standalone' -WindowStyle Hidden | Out-Null
    $deadline=(Get-Date).AddSeconds(20)
    while((Get-Date) -lt $deadline){ if (Test-TcpPortOpen -host '127.0.0.1' -port 3306 -timeoutMs 500) { Write-Ok 'MySQL started'; return } Start-Sleep -Milliseconds 500 }
    Write-Warn 'MySQL did not respond in time. Continuing anyway.'
  } else {
    Write-Warn 'mysqld.exe not found and port 3306 closed. Start MySQL manually if bootstrap fails.'
  }
}

function Wait-HttpOk([string]$url, [int]$timeoutSec=60){
  $deadline=(Get-Date).AddSeconds($timeoutSec)
  while((Get-Date) -lt $deadline){ try{ $r=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 5; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 300){ return $true } }catch{}; Start-Sleep -Milliseconds 500 }
  return $false
}

function Start-ServiceDev([string]$filter, [string]$healthUrl, [string]$name){
  Write-Info "Starting $name..."
  $proc = Start-Process -FilePath powershell -ArgumentList @('-NoProfile','-Command',"pnpm --filter $filter run dev") -WindowStyle Hidden -PassThru
  $ok = Wait-HttpOk -url $healthUrl -timeoutSec 60
  if ($ok) { Write-Ok "$name OK: $healthUrl" } else { Write-Warn "$name did not return 2xx at $healthUrl (PID=$($proc.Id))" }
  return $proc
}

# 1) MySQL + Bootstrap
if (-not $NoBootstrap) {
  Ensure-MySql
  $bootstrapArgs = @()
  if ($NoSeeds) { $bootstrapArgs += '-NoSeeds' }
  Write-Info 'Bootstrapping databases / Prisma / seeds...'
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'bootstrap.ps1') @bootstrapArgs
}

# 2) Services + Frontend
$procs = @{}
$pids = @{}

$procs.users    = Start-ServiceDev '@epem/users-service'    'http://localhost:3020/api/health' 'users-service'
$procs.patients = Start-ServiceDev '@epem/patients-service' 'http://localhost:3010/health'     'patients-service'
$procs.catalog  = Start-ServiceDev '@epem/catalog-service'  'http://localhost:3030/health'     'catalog-service'
$procs.billing  = Start-ServiceDev '@epem/billing-service'  'http://localhost:3040/health'     'billing-service'
$procs.gateway  = Start-ServiceDev '@epem/api-gateway'      'http://localhost:4000/health'     'api-gateway'
$procs.web      = Start-ServiceDev '@epem/web'              'http://localhost:3000/login'      'web (Next.js)'

foreach($k in $procs.Keys){ if($procs[$k]){ $pids[$k] = $procs[$k].Id } }

New-Item -Force -ItemType Directory -Path (Join-Path $PSScriptRoot '../../.tmp') | Out-Null
$pids | ConvertTo-Json | Out-File -Encoding utf8 (Join-Path $PSScriptRoot '../../.tmp/dev-pids.json')

Write-Ok ("Services started. PIDs: {0}" -f (($pids.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join ', '))
Write-Host 'To stop quickly: pnpm dev:stop' -ForegroundColor Yellow

