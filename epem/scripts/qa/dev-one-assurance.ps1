param(
  [switch]$SkipMySql,
  [int]$TimeoutPerScenarioSec = 900
)

$ErrorActionPreference = 'Continue'

function Info($m){ Write-Host "[assure-dev:one] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[assure-dev:one] $m" -ForegroundColor Green }
function Warn($m){ Write-Warning "[assure-dev:one] $m" }
function Fail($m){ Write-Error "[assure-dev:one] $m" }

$Root = Resolve-Path "$PSScriptRoot/../.." | % { $_.Path }
$Tmp = Join-Path $Root '.tmp'
New-Item -Force -ItemType Directory -Path $Tmp | Out-Null
$ReportMd = Join-Path $Root 'docs/qa/dev-one-assurance-report.md'

$results = @()
function Push-Result([string]$name, [bool]$pass, [string]$details){
  $results += [pscustomobject]@{ name=$name; pass=$pass; details=$details }
}

function Write-Report(){
  $passAll = (($results | Where-Object { -not $_.pass }).Count -eq 0)
  $overall = if ($passAll) { 'PASS' } else { 'FAIL' }
  $lines = New-Object System.Collections.Generic.List[string]
  $null = $lines.Add('# QA Report - dev:one Assurance')
  $null = $lines.Add('Resultado: "' + $overall + '"')
  $null = $lines.Add('')
  foreach($r in $results){
    $status = if ($r.pass) { 'PASS' } else { 'FAIL' }
    $null = $lines.Add("- [$status] $($r.name) - $($r.details)")
  }
  New-Item -Force -ItemType Directory -Path (Split-Path $ReportMd -Parent) | Out-Null
  Set-Content -Encoding UTF8 -Path $ReportMd -Value ($lines -join "`n")
  if ($passAll) { Ok 'Assurance report: PASS' } else { Warn 'Assurance report: FAIL' }
  Write-Host "Reporte: $ReportMd" -ForegroundColor Yellow
}

function Run-DevOne([string]$label){
  Info "[$label] Stop + dev:one"
  pnpm dev:stop | Out-Null
  $t0 = Get-Date
  $p = Start-Process -FilePath 'pnpm' -ArgumentList @('dev') -PassThru -WindowStyle Hidden
  $deadline = (Get-Date).AddSeconds($TimeoutPerScenarioSec)
  while(-not $p.HasExited){ if ((Get-Date) -gt $deadline) { try { $p.Kill() } catch {}; break } Start-Sleep -Seconds 2 }
  $exit = if ($p.HasExited) { $p.ExitCode } else { 1 }
  $dur = [int]((Get-Date) - $t0).TotalSeconds
  $gate = 'UNKNOWN'
  try{
    $br = Get-Content -Raw (Join-Path $Root 'docs/qa/back-report.md')
    $gate = if ($br -match 'Resultado:\s*"PASS"') { 'PASS' } else { 'FAIL' }
  }catch{ $gate = 'FAIL' }
  return @([pscustomobject]@{ Exit=$exit; Gate=$gate; DurationSec=$dur })
}

function Scenario-ColdStart(){
  $name = 'Cold start (sin node_modules y sin .env)'
  Info $name
  try {
    Remove-Item -Recurse -Force (Join-Path $Root 'node_modules') -ErrorAction SilentlyContinue
    Remove-Item -Force (Join-Path $Root '.env') -ErrorAction SilentlyContinue
  } catch {}
  $r = Run-DevOne $name
  $pass = ($r.Exit -eq 0 -and $r.Gate -eq 'PASS')
  Push-Result $name $pass ("exit=$($r.Exit) gate=$($r.Gate) t=$($r.DurationSec)s")
}

function Scenario-LockMismatched(){
  $name = 'Lockfile más nuevo (fuerza install)'
  Info $name
  $lock = Join-Path $Root 'pnpm-lock.yaml'
  if (Test-Path $lock){ (Get-Item $lock).LastWriteTime = (Get-Date) }
  $r = Run-DevOne $name
  $pass = ($r.Exit -eq 0 -and $r.Gate -eq 'PASS')
  Push-Result $name $pass ("exit=$($r.Exit) gate=$($r.Gate) t=$($r.DurationSec)s")
}

function Start-PortBlocker([int]$port){
  $node = (Get-Command node -ErrorAction SilentlyContinue)
  if (-not $node) { return $null }
  $js = @"
const net = require('net');
const srv = net.createServer(()=>{});
srv.listen(process.env.PORT || 0, '127.0.0.1');
process.on('SIGTERM',()=>srv.close(()=>process.exit(0)));
"@
  $blk = Join-Path $Tmp "port-blocker-$port.js"
  Set-Content -Encoding UTF8 -Path $blk -Value $js
  $p = Start-Process -FilePath $node.Source -ArgumentList @($blk) -WorkingDirectory $Tmp -PassThru -WindowStyle Hidden -RedirectStandardOutput (Join-Path $Tmp "pb-$port.out.txt") -RedirectStandardError (Join-Path $Tmp "pb-$port.err.txt")
  Start-Sleep -Milliseconds 200
  return $p
}

function Scenario-BusyPorts(){
  $name = 'Puertos ocupados (3000,3010..4000)'
  Info $name
  $ports = @(3000,3010,3020,3030,3040,4000)
  $pids = @()
  foreach($p in $ports){ $proc = Start-PortBlocker $p; if ($proc) { $pids += $proc } }
  $r = Run-DevOne $name
  foreach($pp in $pids){ try { $pp.Kill() } catch {} }
  $pass = ($r.Exit -eq 0 -and $r.Gate -eq 'PASS')
  Push-Result $name $pass ("exit=$($r.Exit) gate=$($r.Gate) t=$($r.DurationSec)s")
}

function Scenario-StalePids(){
  $name = 'PIDs obsoletos (.tmp/dev-pids.json)'
  Info $name
  $pidsFile = Join-Path $Root '.tmp/dev-pids.json'
  New-Item -Force -ItemType Directory -Path (Split-Path $pidsFile -Parent) | Out-Null
  Set-Content -Encoding UTF8 -Path $pidsFile -Value '{"billing":99999,"gateway":99998,"users":99997,"patients":99996,"web":99995,"catalog":99994}'
  $r = Run-DevOne $name
  $pass = ($r.Exit -eq 0 -and $r.Gate -eq 'PASS')
  Push-Result $name $pass ("exit=$($r.Exit) gate=$($r.Gate) t=$($r.DurationSec)s")
}

function Scenario-AdminReset(){
  $name = 'Reset de admin (password de .env)'
  Info $name
  $envPath = Join-Path $Root '.env'
  $orig = if (Test-Path $envPath) { Get-Content -Raw $envPath } else { $null }
  $text = if ($orig) { $orig } else { Get-Content -Raw (Join-Path $Root '.env.example') }
  $text = ($text -replace '(?m)^ADMIN_PASSWORD=.*$', 'ADMIN_PASSWORD=admin123')
  Set-Content -Encoding UTF8 -Path $envPath -Value $text
  $r = Run-DevOne $name
  $pass = ($r.Exit -eq 0 -and $r.Gate -eq 'PASS')
  Push-Result $name $pass ("exit=$($r.Exit) gate=$($r.Gate) t=$($r.DurationSec)s")
}

# Ejecutar escenarios
Scenario-ColdStart
Scenario-LockMismatched
Scenario-BusyPorts
Scenario-StalePids
Scenario-AdminReset

Write-Report
