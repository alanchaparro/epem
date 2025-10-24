param([switch]$NoSeeds)

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
  } catch { return $null }
}

function Find-MySqlExe {
  $candidates = @(
    'C:\\xampp\\mysql\\bin\\mysql.exe',
    'C:\\Program Files\\MySQL\\MySQL Server 8.0\\bin\\mysql.exe',
    'mysql'
  )
  foreach ($c in $candidates) {
    if ($c -eq 'mysql') { if (Get-Command mysql -ErrorAction SilentlyContinue) { return 'mysql' } }
    else { if (Test-Path $c) { return $c } }
  }
  return $null
}

function Ensure-Database {
  param([string]$MysqlExe, [object]$Cfg)
  $args = @('-N','-s','-e')
  if ($Cfg.Host) { $args += @('-h', $Cfg.Host) }
  if ($Cfg.Port) { $args += @('-P', $Cfg.Port) }
  if ($Cfg.User) { $args += @('-u', $Cfg.User) }
  if ($null -ne $Cfg.Password -and $Cfg.Password -ne '') { $args += @("-p$($Cfg.Password)") }
  $exists = & $MysqlExe @($args + @("SHOW DATABASES LIKE '$($Cfg.Database)';")) 2>$null
  if (-not ($exists -match "^$([regex]::Escape($Cfg.Database))$")) {
    Write-Host "Creando base de datos $($Cfg.Database)" -ForegroundColor Cyan
    $create = "CREATE DATABASE IF NOT EXISTS $($Cfg.Database) CHARACTER SET utf8mb4;"
    & $MysqlExe @($args + @($create)) | Out-Null
  } else {
    Write-Host "BD $($Cfg.Database) OK" -ForegroundColor DarkGreen
  }
}

$root = Resolve-Path "$PSScriptRoot/../.." | ForEach-Object { $_.Path }
$envs = Load-DotEnv -Path (Join-Path $root '.env')
$mysql = Find-MySqlExe
if (-not $mysql) { Write-Error 'mysql.exe no encontrado. Instalar XAMPP o agregar a PATH.'; exit 1 }

$urls = @(
  $envs['USERS_SERVICE_DATABASE_URL'],
  $envs['PATIENTS_SERVICE_DATABASE_URL'],
  $envs['CATALOG_SERVICE_DATABASE_URL'],
  $envs['BILLING_SERVICE_DATABASE_URL']
)

foreach ($u in $urls) {
  if ($u) { $cfg = Parse-MySqlUrl -Url $u; if ($cfg) { Ensure-Database -MysqlExe $mysql -Cfg $cfg } }
}

function Invoke-PrismaGenerateWithRetry {
  param([string]$ServicePath, [int]$Max = 3)
  pushd $ServicePath
  for ($i = 1; $i -le $Max; $i++) {
    try {
      $engine = Join-Path $ServicePath 'generated/client/query_engine-windows.dll.node'
      if (Test-Path $engine) { Remove-Item -Force $engine -ErrorAction SilentlyContinue }
      npx prisma generate --schema prisma/schema.prisma
      popd
      return
    } catch {
      if ($i -eq $Max) { popd; throw }
      Start-Sleep -Milliseconds 700
    }
  }
}

Write-Host 'Ejecutando Prisma db push (crear/actualizar tablas)' -ForegroundColor Green
# Exporta variables de entorno para prisma CLI
$env:USERS_SERVICE_DATABASE_URL   = $envs['USERS_SERVICE_DATABASE_URL']
$env:PATIENTS_SERVICE_DATABASE_URL = $envs['PATIENTS_SERVICE_DATABASE_URL']
$env:CATALOG_SERVICE_DATABASE_URL  = $envs['CATALOG_SERVICE_DATABASE_URL']
$env:BILLING_SERVICE_DATABASE_URL  = $envs['BILLING_SERVICE_DATABASE_URL']

pushd "$root/services/users-service";    npx prisma db push --skip-generate --schema prisma/schema.prisma; popd
pushd "$root/services/patients-service"; npx prisma db push --skip-generate --schema prisma/schema.prisma; popd
pushd "$root/services/catalog-service";  npx prisma db push --skip-generate --schema prisma/schema.prisma; popd
pushd "$root/services/billing-service";  npx prisma db push --skip-generate --schema prisma/schema.prisma; popd

# Generar clientes Prisma con retry (mitiga EPERM en Windows)
Invoke-PrismaGenerateWithRetry -ServicePath (Join-Path $root 'services/users-service')
Invoke-PrismaGenerateWithRetry -ServicePath (Join-Path $root 'services/patients-service')
Invoke-PrismaGenerateWithRetry -ServicePath (Join-Path $root 'services/catalog-service')
Invoke-PrismaGenerateWithRetry -ServicePath (Join-Path $root 'services/billing-service')

if (-not $NoSeeds) {
  Write-Host 'Seeds iniciales (admin, pacientes, catalogo, aseguradoras)' -ForegroundColor Green
  pnpm --filter @epem/users-service seed:admin
  pnpm --filter @epem/patients-service seed:patients
  pnpm --filter @epem/catalog-service seed:items
  pnpm --filter @epem/billing-service seed:insurers
}

Write-Host 'Bootstrap completado.' -ForegroundColor Green
