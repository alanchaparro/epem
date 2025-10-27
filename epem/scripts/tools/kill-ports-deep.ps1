param(
  [Parameter(Mandatory=$true, Position=0)]
  [int[]]$Ports,
  [switch]$VerboseOutput
)

$ErrorActionPreference = 'SilentlyContinue'

function pinfo($pid){
  try {
    $p = Get-CimInstance Win32_Process -Filter "ProcessId=$pid"
    if(-not $p){ return "pid=$pid (not found)" }
    return "pid=$($p.ProcessId) name=$($p.Name) parent=$($p.ParentProcessId) cmd=$($p.CommandLine)"
  } catch { return "pid=$pid (error)" }
}

function Kill-Tree($pid){
  try { & taskkill /PID $pid /F /T | Out-Null } catch {}
}

$killed = @()
foreach($port in $Ports){
  $pids = @()
  try {
    $conns = Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue
    if(-not $conns){ $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue }
    if($conns){ $pids += @($conns | Select-Object -ExpandProperty OwningProcess -Unique) }
  } catch {}
  if(-not $pids -or $pids.Count -eq 0){
    try {
      $lines = netstat -ano | Select-String (":$port")
      foreach($ln in $lines){ $t = ($ln.ToString() -split '\s+')[-1]; if($t -match '^[0-9]+$'){ $pids += [int]$t } }
      $pids = $pids | Sort-Object -Unique
    } catch {}
  }
  foreach($pid in $pids){
    if($VerboseOutput){ Write-Host ("[kill-ports-deep] killing {0}" -f (pinfo $pid)) -ForegroundColor Yellow }
    Kill-Tree $pid
    $killed += "port=$port pid=$pid"
  }
}

if($killed.Count -gt 0){ Write-Host ("[kill-ports-deep] killed: {0}" -f ($killed -join '; ')) -ForegroundColor Green }
else { Write-Host "[kill-ports-deep] nothing to kill for given ports" -ForegroundColor DarkGray }
