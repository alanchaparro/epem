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
  if ($script:UseDockerMySql) {
    $host = if ($Cfg.Host -eq 'localhost') { '127.0.0.1' } else { $Cfg.Host }
    $dockArgs = @('exec','-i','epem-mysql','mysql','-N','-s','-h', $host, '-P', $Cfg.Port, '-u', $Cfg.User)
    if ($null -ne $Cfg.Password -and $Cfg.Password -ne '') { $dockArgs += @("-p$($Cfg.Password)") }
    $exists = docker @($dockArgs + @('-e',"SHOW DATABASES LIKE '$($Cfg.Database)';")) 2>$null
    if (-not ($exists -match "^$([regex]::Escape($Cfg.Database))$")) {
      Write-Host "Creando base de datos $($Cfg.Database)" -ForegroundColor Cyan
      $create = "CREATE DATABASE IF NOT EXISTS $($Cfg.Database) CHARACTER SET utf8mb4;"
      docker @($dockArgs + @('-e',$create)) | Out-Null
    } else {
      Write-Host "BD $($Cfg.Database) OK" -ForegroundColor DarkGreen
    }
    return
  }
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
$script:UseDockerMySql = $false
if (-not $mysql) {
  # Fallback: usar MySQL en contenedor si existe epem-mysql y Docker disponible
  try {
    docker version 1>$null 2>$null
    if ($LASTEXITCODE -eq 0) {
      $exists = (docker ps -a --filter "name=^/epem-mysql$" --format '{{.Names}}')
      if (-not $exists) {
        Write-Warning 'mysql.exe no encontrado. Intentando fallback con Docker (contenedor epem-mysql)...'
        docker run -d --name epem-mysql -p 3306:3306 -e MYSQL_ROOT_PASSWORD=root mysql:8.0 --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci | Out-Null
        Start-Sleep -Seconds 5
      }
      $running = (docker ps --filter "name=^/epem-mysql$" --format '{{.Names}}')
      if ($running -eq 'epem-mysql') { $script:UseDockerMySql = $true } else { Write-Error 'No hay MySQL y Docker fallback no disponible.'; exit 1 }
    } else { Write-Error 'mysql.exe no encontrado y Docker no disponible.'; exit 1 }
  } catch { Write-Error 'mysql.exe no encontrado y Docker no disponible.'; exit 1 }
}

$urls = @(
  $envs['USERS_SERVICE_DATABASE_URL'],
  $envs['PATIENTS_SERVICE_DATABASE_URL'],
  $envs['CATALOG_SERVICE_DATABASE_URL'],
  $envs['BILLING_SERVICE_DATABASE_URL']
)

foreach ($u in $urls) {
  if ($u) { $cfg = Parse-MySqlUrl -Url $u; if ($cfg) { Ensure-Database -MysqlExe $mysql -Cfg $cfg } }
}

function Should-GeneratePrismaClient {
  param([string]$ServicePath)
  $schemaPath = Join-Path $ServicePath 'prisma/schema.prisma'
  $generatedSchema = Join-Path $ServicePath 'generated/client/schema.prisma'
  if (-not (Test-Path $schemaPath)) { return $false }
  if (-not (Test-Path $generatedSchema)) { return $true }
  try {
    $srcTime = (Get-Item $schemaPath).LastWriteTimeUtc
    $genTime = (Get-Item $generatedSchema).LastWriteTimeUtc
    return $srcTime -gt $genTime
  } catch {
    return $true
  }
}

function Clear-PrismaTempLocks {
  param([string]$ServicePath)
  $clientDir = Join-Path $ServicePath 'generated/client'
  if (-not (Test-Path $clientDir)) { return }
  try {
    & cmd /c "attrib -R `"$clientDir\*.*`" /S /D" | Out-Null
  } catch {}
  try {
    Get-ChildItem -LiteralPath $clientDir -Filter '*.tmp*' -Recurse -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
  } catch {}
  $engine = Join-Path $clientDir 'query_engine-windows.dll.node'
  if (Test-Path $engine) {
    try { Remove-Item -Force $engine -ErrorAction SilentlyContinue } catch {}
  }
}

function Invoke-PrismaGenerateWithRetry {
  param([string]$ServicePath, [int]$Max = 6)
  pushd $ServicePath
  $shouldGenerate = Should-GeneratePrismaClient -ServicePath $ServicePath
  if (-not $shouldGenerate) {
    Write-Host "Prisma client en $ServicePath actualizado (sin cambios)." -ForegroundColor DarkGreen
    popd
    return
  }
  for ($i = 1; $i -le $Max; $i++) {
    try {
      Clear-PrismaTempLocks -ServicePath $ServicePath
      $env:PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = '1'
      npx prisma generate --schema prisma/schema.prisma
      Write-Host "Prisma client generado OK en $ServicePath" -ForegroundColor DarkGreen
      popd
      return
    } catch {
      if ($i -eq $Max) { popd; throw }
      $delay = [int](700 * [math]::Pow(1.6, ($i-1)))
      Write-Warning "Retry prisma generate ($i/$Max) en $ServicePath tras error: $($_.Exception.Message)"
      Start-Sleep -Milliseconds $delay
    }
  }
}

Write-Host 'Ejecutando Prisma db push (crear/actualizar tablas)' -ForegroundColor Green
# Usar scripts por paquete via pnpm --filter para evitar dependencias globales de npx
pnpm --filter @epem/users-service prisma:push
pnpm --filter @epem/patients-service prisma:push
pnpm --filter @epem/catalog-service prisma:push
pnpm --filter @epem/billing-service prisma:push

# Generar clientes Prisma con retry (mitiga EPERM en Windows)
Invoke-PrismaGenerateWithRetry -ServicePath (Join-Path $root 'services/users-service')
Invoke-PrismaGenerateWithRetry -ServicePath (Join-Path $root 'services/patients-service')
Invoke-PrismaGenerateWithRetry -ServicePath (Join-Path $root 'services/catalog-service')
Invoke-PrismaGenerateWithRetry -ServicePath (Join-Path $root 'services/billing-service')

if (-not $NoSeeds) {
  Write-Host 'Seeds iniciales (admin, pacientes, catalogo, aseguradoras)' -ForegroundColor Green
  # Asegura password del admin en DEV según .env (ADMIN_PASSWORD)
  $prevReset = $env:ADMIN_RESET_PASSWORD
  $env:ADMIN_RESET_PASSWORD = 'true'
  pnpm --filter @epem/users-service seed:admin
  if ($null -ne $prevReset) { $env:ADMIN_RESET_PASSWORD = $prevReset } else { Remove-Item Env:ADMIN_RESET_PASSWORD -ErrorAction SilentlyContinue }
  pnpm --filter @epem/patients-service seed:patients
  pnpm --filter @epem/catalog-service seed:items
  pnpm --filter @epem/billing-service seed:insurers
}

Write-Host 'Bootstrap completado.' -ForegroundColor Green
