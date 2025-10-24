param(
  [int[]]$Ports = @(3000, 3001, 3010, 3020, 3030, 3040, 4000),
  [switch]$Quiet
)

$killed = @{}

function Overwrite-StopProcess {
  param([int]$Port, [string]$PidValue)
  $localPid = [int]$PidValue
  try {
    Stop-Process -Id $localPid -Force -ErrorAction Stop
    if (-not $killed.ContainsKey($Port)) {
      $killed[$Port] = @()
    }
    $killed[$Port] += $localPid
  } catch {}
}

function Stop-Port {
  param([int]$Port)

  try {
    $conns = Get-NetTCPConnection -LocalPort $Port -ErrorAction Stop
    if ($null -ne $conns) {
      $pids = $conns.OwningProcess | Sort-Object -Unique
      foreach ($pid in $pids) {
        try {
          Stop-Process -Id $pid -Force -ErrorAction Stop
          if (-not $killed.ContainsKey($Port)) { $killed[$Port] = @() }
          $killed[$Port] += $pid
        } catch {
          if (-not $_.Exception.Message.Contains('No process is associated')) {
            throw
          }
        }
      }
    }
  } catch {
    if ($_.FullyQualifiedErrorId -notlike '*NotFound*') {
      $lines = netstat -ano | Select-String ":$Port"
      foreach ($line in $lines) {
        $pidValue = ($line.ToString() -split '\s+')[-1]
        if ($pidValue -match '^[0-9]+$') {
          Overwrite-StopProcess -Port $Port -PidValue $pidValue
        }
      }
    }
  }
}

foreach ($port in $Ports | Sort-Object -Unique) {
  Stop-Port -Port $port
}

if (-not $Quiet) {
  if ($killed.Count -eq 0) {
    Write-Host "Sin procesos activos en puertos: $(( $Ports | Sort-Object ) -join ', ')" -ForegroundColor DarkGreen
  } else {
    foreach ($entry in $killed.GetEnumerator() | Sort-Object Name) {
      $values = $entry.Value | Sort-Object -Unique
      Write-Host ("Puerto {0} -> PIDs detenidos: {1}" -f $entry.Key, ($values -join ', ')) -ForegroundColor Yellow
    }
  }
}
