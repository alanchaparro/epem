param()

function Load-DotEnv {
  param([string]$Path)
  $envMap = @{}
  if (-not (Test-Path $Path)) { return $envMap }
  Get-Content -Raw -Path $Path | ForEach-Object { $_ -split "`n" } | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
      $idx = $line.IndexOf('=')
      $key = $line.Substring(0, $idx).Trim()
      $value = $line.Substring($idx + 1).Trim()
      $envMap[$key] = $value
    }
  }
  return $envMap
}

function Parse-MySqlUrl {
  param([string]$Url)
  try {
    $uri = [Uri]$Url
    $user = $uri.UserInfo
    $userName = $null
    $password = $null
    if ($user) {
      $parts = $user.Split(':', 2)
      $userName = $parts[0]
      if ($parts.Count -gt 1) { $password = $parts[1] }
    }
    return [pscustomobject]@{
      Host     = $uri.Host
      Port     = if ($uri.Port -gt 0) { $uri.Port } else { 3306 }
      User     = $userName
      Password = $password
      Database = $uri.AbsolutePath.TrimStart('/')
    }
  } catch {
    return $null
  }
}

function Find-MySqlExe {
  $candidates = @(
    'C:\xampp\mysql\bin\mysql.exe',
    'C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe',
    'mysql'
  )
  foreach ($candidate in $candidates) {
    if ($candidate -eq 'mysql') {
      if (Get-Command mysql -ErrorAction SilentlyContinue) { return 'mysql' }
    } elseif (Test-Path $candidate) {
      return $candidate
    }
  }
  return $null
}

function Ensure-Database {
  param($MysqlExe, $Cfg)
  $args = @('-N', '-s', '-e')
  if ($Cfg.Host) { $args += @('-h', $Cfg.Host) }
  if ($Cfg.Port) { $args += @('-P', $Cfg.Port) }
  if ($Cfg.User) { $args += @('-u', $Cfg.User) }
  if ($null -ne $Cfg.Password -and $Cfg.Password -ne '') { $args += @("-p$($Cfg.Password)") }
  $query = "SHOW DATABASES LIKE '$($Cfg.Database)';"
  $exists = & $MysqlExe @($args + @($query)) 2>$null
  if (-not ($exists -match "^$([regex]::Escape($Cfg.Database))$")) {
    $create = "CREATE DATABASE IF NOT EXISTS `$($Cfg.Database)` CHARACTER SET utf8mb4;"
    Write-Host "Creando base de datos $($Cfg.Database)" -ForegroundColor Cyan
    & $MysqlExe @($args + @($create)) | Out-Null
  }
}

function Table-Exists {
  param($MysqlExe, $Cfg, [string]$Table)
  $args = @('-N', '-s', '-e')
  if ($Cfg.Host) { $args += @('-h', $Cfg.Host) }
  if ($Cfg.Port) { $args += @('-P', $Cfg.Port) }
  if ($Cfg.User) { $args += @('-u', $Cfg.User) }
  if ($null -ne $Cfg.Password -and $Cfg.Password -ne '') { $args += @("-p$($Cfg.Password)") }
  $query = "SHOW TABLES FROM `$($Cfg.Database)` LIKE '$Table';"
  $result = & $MysqlExe @($args + @($query)) 2>$null
  $normalized = ($result | ForEach-Object { $_.Trim().ToLowerInvariant() })
  return $normalized -contains $Table.ToLowerInvariant()
}

function Run-PrismaPush {
  param([string]$Root, [string]$Filter)
  Push-Location $Root
  try {
    Write-Host "Ejecutando prisma:push para $Filter" -ForegroundColor Yellow
    pnpm --filter $Filter prisma:push | Out-Default
  } finally {
    Pop-Location
  }
}

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Resolve-Path (Join-Path $scriptRoot '..\..') | ForEach-Object { $_.Path }
$envPath = Join-Path $root '.env'
$envs = Load-DotEnv -Path $envPath

$mysqlExe = Find-MySqlExe
if (-not $mysqlExe) {
  Write-Error 'mysql.exe no encontrado. Instala MySQL o define una ruta valida.'
  exit 1
}

$services = @(
  [pscustomobject]@{ Name = 'Users-service'; UrlVar = 'USERS_SERVICE_DATABASE_URL'; Tables = @('User'); Filter = '@epem/users-service' },
  [pscustomobject]@{ Name = 'Patients-service'; UrlVar = 'PATIENTS_SERVICE_DATABASE_URL'; Tables = @('Patient', 'Order'); Filter = '@epem/patients-service' },
  [pscustomobject]@{ Name = 'Catalog-service'; UrlVar = 'CATALOG_SERVICE_DATABASE_URL'; Tables = @('ServiceItem'); Filter = '@epem/catalog-service' },
  [pscustomobject]@{ Name = 'Billing-service'; UrlVar = 'BILLING_SERVICE_DATABASE_URL'; Tables = @('Insurer', 'Coverage', 'Authorization', 'Invoice'); Filter = '@epem/billing-service' }
)

$summary = @()

foreach ($svc in $services) {
  $url = $envs[$svc.UrlVar]
  if (-not $url) {
    Write-Warning "[$($svc.Name)] Variable $($svc.UrlVar) no definida en .env"
    $summary += [pscustomobject]@{ service = $svc.Name; status = 'MISSING_URL'; action = 'Definir URL en .env' }
    continue
  }
  $cfg = Parse-MySqlUrl -Url $url
  if (-not $cfg) {
    Write-Warning "[$($svc.Name)] URL invalida: $url"
    $summary += [pscustomobject]@{ service = $svc.Name; status = 'INVALID_URL'; action = 'Corregir URL en .env' }
    continue
  }

  Ensure-Database -MysqlExe $mysqlExe -Cfg $cfg

  $missing = @()
  foreach ($table in $svc.Tables) {
    if (-not (Table-Exists -MysqlExe $mysqlExe -Cfg $cfg -Table $table)) {
      $missing += $table
    }
  }

  if ($missing.Count -gt 0) {
    Write-Host "[$($svc.Name)] Tablas faltantes: $($missing -join ', ')" -ForegroundColor Yellow
    Run-PrismaPush -Root $root -Filter $svc.Filter
    $summary += [pscustomobject]@{
      service = $svc.Name
      status  = 'PUSHED'
      action  = 'Se ejecuto prisma:push (verificar tablas manualmente si es necesario)'
    }
  } else {
    $summary += [pscustomobject]@{ service = $svc.Name; status = 'OK'; action = 'Sin cambios' }
  }
}

Write-Host '--- Resumen ---' -ForegroundColor Cyan
$summary | Format-Table -AutoSize
