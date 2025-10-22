param()
. "$PSScriptRoot/utils.ps1"

function Load-DotEnv {
  param([string]$Path)
  $envMap = @{}
  if (-not (Test-Path $Path)) { return $envMap }
  Get-Content -Raw -Path $Path | ForEach-Object { $_ -split "`n" } | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')) {
      $idx = $line.IndexOf('=')
      $k = $line.Substring(0, $idx).Trim()
      $v = $line.Substring($idx + 1).Trim()
      $envMap[$k] = $v
    }
  }
  return $envMap
}

function Parse-MySqlUrl {
  param([string]$Url)
  try {
    $u = [Uri]$Url
    $userInfo = $u.UserInfo
    $user = $null; $pass = $null
    if ($userInfo) {
      $parts = $userInfo.Split(':',2)
      $user = $parts[0]
      if ($parts.Count -gt 1) { $pass = $parts[1] }
    }
    return [pscustomobject]@{
      Host = $u.Host
      Port = if ($u.Port -gt 0) { $u.Port } else { 3306 }
      User = $user
      Password = $pass
      Database = $u.AbsolutePath.TrimStart('/')
    }
  } catch {
    return $null
  }
}

function Find-MySqlExe {
  $candidates = @(
    'C:\\xampp\\mysql\\bin\\mysql.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
    'mysql'
  )
  foreach ($c in $candidates) {
    if ($c -eq 'mysql') {
      if (Get-Command mysql -ErrorAction SilentlyContinue) { return 'mysql' }
    } else {
      if (Test-Path $c) { return $c }
    }
  }
  return $null
}

$results = @()
$envPath = Join-Path $PSScriptRoot '../../.env'
$envs = Load-DotEnv -Path $envPath

$mysqlExe = Find-MySqlExe
if (-not $mysqlExe) {
  $results += Assert-True $false 'MySQL CLI disponible' 'No se encontró mysql.exe en PATH ni en rutas comunes'
  Save-Report -Results $results -JsonPath "$PSScriptRoot/../../docs/qa/db-results.json" -MarkdownPath "$PSScriptRoot/../../docs/qa/db-report.md"
  Write-Host 'DB QA terminado (mysql no disponible). Ver docs/qa/db-report.md' -ForegroundColor Yellow
  exit 1
}

function Test-Db {
  param([string]$Name, [string]$Url, [string[]]$ExpectedTables)
  if (-not $Url) {
    return @(
      (Assert-True $false "$Name URL configurada" 'Falta variable en .env')
    )
  }
  $cfg = Parse-MySqlUrl -Url $Url
  if (-not $cfg) {
    return @(
      (Assert-True $false "$Name URL válida" $Url)
    )
  }
  $args = @()
  if ($cfg.Host) { $args += @('-h', $cfg.Host) }
  if ($cfg.Port) { $args += @('-P', $cfg.Port) }
  if ($cfg.User) { $args += @('-u', $cfg.User) }
  if ($null -ne $cfg.Password -and $cfg.Password -ne '') { $args += @("-p$($cfg.Password)") }
  $args += @('-N','-s','-e')

  $dbExists = & $mysqlExe @($args + @("SHOW DATABASES LIKE '$($($cfg.Database))';")) 2>$null
  $dbOk = [bool]($dbExists -match "^$([regex]::Escape($cfg.Database))$")
  $res = @()
  $res += Assert-True $dbOk "$Name base de datos existe ($($cfg.Database))" ($dbExists)
  if (-not $dbOk) { return $res }

  foreach ($t in $ExpectedTables) {
    $query = "SHOW TABLES FROM $($cfg.Database) LIKE '$t';"
    $tbl = & $mysqlExe @($args + @($query)) 2>$null
    $ok = [bool]($tbl -match "^$([regex]::Escape($t))$")
    # Si $tbl es array, lo mostramos como texto
    $actual = if ($tbl -is [array]) { ($tbl -join ',') } else { $tbl }
    $res += Assert-True $ok "$Name tabla '$t' existe" ($actual)
  }
  return $res
}

# Checks esperados por servicio
$results += Test-Db -Name 'Users-service' -Url $envs['USERS_SERVICE_DATABASE_URL'] -ExpectedTables @('User')
$results += Test-Db -Name 'Patients-service' -Url $envs['PATIENTS_SERVICE_DATABASE_URL'] -ExpectedTables @('Patient')
$results += Test-Db -Name 'Catalog-service' -Url $envs['CATALOG_SERVICE_DATABASE_URL'] -ExpectedTables @('ServiceItem')

New-Item -Force -ItemType Directory -Path "$PSScriptRoot/../../docs/qa" | Out-Null
Save-Report -Results $results -JsonPath "$PSScriptRoot/../../docs/qa/db-results.json" -MarkdownPath "$PSScriptRoot/../../docs/qa/db-report.md"
Write-Host 'DB QA terminado. Ver docs/qa/db-report.md' -ForegroundColor Green
