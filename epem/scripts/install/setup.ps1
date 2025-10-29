param(
  [switch]$NoInstall,
  [switch]$NoBootstrap
)

$ErrorActionPreference = 'Stop'

function Info($m){ Write-Host "[install] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[install] $m" -ForegroundColor Green }
function Warn($m){ Write-Warning "[install] $m" }
function Fail($m){ Write-Error "[install] $m" }

$Root = Split-Path -Parent $PSScriptRoot
$Root = Split-Path -Parent $Root # go to repo root

function Ensure-Pnpm{
  if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)){
    Fail "PNPM no está instalado. Instálalo desde https://pnpm.io/installation y vuelve a ejecutar: pnpm run install:interactive"; exit 1
  }
}

function Prompt-Value([string]$label, [string]$default){
  $p = Read-Host "$label [$default]"
  if ([string]::IsNullOrWhiteSpace($p)) { return $default } else { return $p }
}

function Load-DotEnvFile([string]$path){
  $map = @{}
  if (-not (Test-Path $path)) { return $map }
  Get-Content -Raw -Encoding UTF8 $path | ForEach-Object { $_ -split "`n" } | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#') -and $line.Contains('=')){
      $idx = $line.IndexOf('=')
      $k = $line.Substring(0,$idx).Trim()
      $v = $line.Substring($idx+1).Trim()
      $map[$k] = $v
    }
  }
  return $map
}

function Coalesce($val, $fallback){
  if ($null -ne $val -and "$val" -ne '') { return $val } else { return $fallback }
}

function Write-Env([hashtable]$kv){
  $lines = New-Object System.Collections.Generic.List[string]
  foreach($k in $kv.Keys){ $null = $lines.Add("$k=$($kv[$k])") }
  $path = Join-Path $Root '.env'
  [System.IO.File]::WriteAllText($path, ($lines -join "`n"), [System.Text.UTF8Encoding]::new($false))
  Ok ".env generado en $path"
}

function Run-Install(){
  $nm = Join-Path $Root 'node_modules'
  $lock = Join-Path $Root 'pnpm-lock.yaml'
  $modulesYaml = Join-Path $nm '.modules.yaml'

  function Invoke-Install([switch]$Frozen){
    if ($Frozen) { Info 'Instalando dependencias (pnpm install --frozen-lockfile)'; pnpm install --frozen-lockfile | Out-Null }
    else { Info 'Instalando dependencias (pnpm install)'; pnpm install | Out-Null }
    Ok 'Dependencias instaladas'
  }

  # 1) Si no hay node_modules -> instalar
  if (-not (Test-Path $nm)){
    if (Test-Path $lock){ Invoke-Install -Frozen } else { Warn 'pnpm-lock.yaml no encontrado. Install sin --frozen-lockfile.'; Invoke-Install }
    return
  }

  # 2) Si el lockfile es más nuevo que .modules.yaml -> instalar
  $needInstall = $false
  try {
    if ((Test-Path $lock) -and (Test-Path $modulesYaml)){
      $lockTime = (Get-Item $lock).LastWriteTimeUtc
      $modsTime = (Get-Item $modulesYaml).LastWriteTimeUtc
      if ($lockTime -gt $modsTime) { $needInstall = $true }
    }
  } catch {}

  # 3) Si el árbol está inconsistente -> instalar
  if (-not $needInstall){ try { pnpm list --depth -1 1>$null 2>$null } catch { $needInstall = $true } }

  if ($needInstall){ if (Test-Path $lock){ Invoke-Install -Frozen } else { Invoke-Install } }
  else { Ok 'Dependencias al día (install no requerido)' }
}

function Find-MySqlExe(){
  $candidates = @(
    'C:\\xampp\\mysql\\bin\\mysql.exe',
    'mysql'
  )
  foreach($c in $candidates){
    if ($c -eq 'mysql') { if (Get-Command mysql -ErrorAction SilentlyContinue) { return 'mysql' } }
    elseif (Test-Path $c) { return $c }
  }
  return $null
}

# --- Utilidades para entrevista interactiva de motor MySQL ---
function Test-TcpPortOpen([string]$addr, [int]$port, [int]$timeoutMs=800){
  try {
    $client = New-Object System.Net.Sockets.TcpClient
    $iar = $client.BeginConnect($addr, $port, $null, $null)
    if($iar.AsyncWaitHandle.WaitOne($timeoutMs, $false)){
      $client.EndConnect($iar); $client.Close(); return $true
    }
    $client.Close(); return $false
  } catch { return $false }
}

function Detect-XamppMysqld(){
  $p = 'C:\\xampp\\mysql\\bin\\mysqld.exe'
  if (Test-Path $p) { return $p } else { return $null }
}

function Detect-MySqlService(){
  try {
    $svc = Get-Service -ErrorAction SilentlyContinue | Where-Object { $_.Name -match '^(MySQL|mysql|MariaDB).+' -or $_.DisplayName -match 'MySQL|MariaDB' }
    if ($svc) { return ($svc | Select-Object -First 1) }
  } catch {}
  return $null
}

function Detect-Docker(){
  try { docker version 1>$null 2>$null; return ($LASTEXITCODE -eq 0) } catch { return $false }
}

function Ensure-XamppMySql(){
  $mysqld = Detect-XamppMysqld
  if (-not $mysqld) { return $false }
  if (Test-TcpPortOpen -addr '127.0.0.1' -port 3306 -timeoutMs 600) { return $true }
  Info 'Iniciando MySQL de XAMPP en background...'
  try {
    Start-Process -FilePath $mysqld -ArgumentList '--standalone' -WindowStyle Hidden | Out-Null
    $deadline=(Get-Date).AddSeconds(20)
    while((Get-Date) -lt $deadline){ if (Test-TcpPortOpen -addr '127.0.0.1' -port 3306 -timeoutMs 500) { return $true } Start-Sleep -Milliseconds 500 }
  } catch {}
  return $false
}

function Ensure-MySqlService(){
  $svc = Detect-MySqlService
  if (-not $svc) { return $false }
  try {
    if ($svc.Status -ne 'Running') { Start-Service -Name $svc.Name -ErrorAction SilentlyContinue }
  } catch {}
  $deadline=(Get-Date).AddSeconds(20)
  while((Get-Date) -lt $deadline){ if (Test-TcpPortOpen -addr '127.0.0.1' -port 3306 -timeoutMs 500) { return $true } Start-Sleep -Milliseconds 500 }
  return (Test-TcpPortOpen -addr '127.0.0.1' -port 3306 -timeoutMs 500)
}

function Ensure-DockerMySql([int]$HostPort=3306, [string]$RootPassword='root'){
  if (-not (Detect-Docker)) { return $false }
  try {
    $existing = (docker ps -a --filter "name=^/epem-mysql$" --format '{{.Names}}')
    if ($existing -eq 'epem-mysql') {
      docker start epem-mysql | Out-Null
    } else {
      Info "Levantando contenedor MySQL (mysql:8.0) en puerto $HostPort..."
      docker run -d --name epem-mysql -p "$HostPort:3306" -e "MYSQL_ROOT_PASSWORD=$RootPassword" mysql:8.0 --default-authentication-plugin=mysql_native_password --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci | Out-Null
    }
    $deadline=(Get-Date).AddSeconds(30)
    while((Get-Date) -lt $deadline){ if (Test-TcpPortOpen -addr '127.0.0.1' -port $HostPort -timeoutMs 700) { return $true } Start-Sleep -Milliseconds 700 }
  } catch {}
  return $false
}

function Interview-EnsureMySqlEngine([ref]$defaults){
  $hasXampp = [bool](Detect-XamppMysqld)
  $svc = Detect-MySqlService
  $hasService = [bool]$svc
  $hasDocker = Detect-Docker

  Write-Host 'Detecté lo siguiente en tu equipo:' -ForegroundColor Cyan
  Write-Host (" - XAMPP MySQL:      {0}" -f ($(if($hasXampp){'sí'}else{'no'})))
  Write-Host (" - Servicio MySQL:   {0}{1}" -f ($(if($hasService){'sí'}else{'no'})), $(if($hasService){" (" + $svc.Name + ")"}else{''}))
  Write-Host (" - Docker disponible: {0}" -f ($(if($hasDocker){'sí'}else{'no'})))

  $defaultChoice = if ($hasXampp) { '1' } elseif ($hasService) { '2' } elseif ($hasDocker) { '3' } else { '4' }
  $choice = Read-Host ("Selecciona motor para MySQL: [1] XAMPP, [2] Servicio, [3] Docker, [4] Ninguno (manual) [$defaultChoice]")
  if ([string]::IsNullOrWhiteSpace($choice)) { $choice = $defaultChoice }

  switch ($choice) {
    '1' {
      if (-not $hasXampp) { Warn 'No se detectó XAMPP. Continuando sin iniciar MySQL.'; break }
      if (Ensure-XamppMySql) { Ok 'MySQL (XAMPP) arriba en 127.0.0.1:3306' } else { Warn 'No fue posible iniciar MySQL de XAMPP.' }
    }
    '2' {
      if (-not $hasService) { Warn 'No se detectó servicio MySQL/MariaDB.'; break }
      if (Ensure-MySqlService) { Ok ("Servicio {0} arriba en 127.0.0.1:3306" -f $svc.Name) } else { Warn 'No fue posible iniciar el servicio MySQL.' }
    }
    '3' {
      if (-not $hasDocker) { Warn 'Docker no está disponible.'; break }
      # Ajustar defaults para Docker
      $defaults.Value['DATABASE_HOST'] = '127.0.0.1'
      $defaults.Value['DATABASE_PORT'] = '3306'
      $defaults.Value['DATABASE_USER'] = 'root'
      $defaults.Value['DATABASE_PASSWORD'] = 'root'
      if (Ensure-DockerMySql -HostPort 3306 -RootPassword 'root') { Ok 'MySQL (Docker) arriba en 127.0.0.1:3306 (root/root)' } else { Warn 'No fue posible levantar MySQL en Docker.' }
    }
    Default {
      Warn 'Seleccionado: Ninguno. El instalador no iniciará MySQL; deberás tenerlo disponible.'
      Write-Host 'Opciones rápidas:' -ForegroundColor DarkYellow
      Write-Host ' - Instalar XAMPP:   winget install -e --id ApacheFriends.XAMPP' -ForegroundColor DarkYellow
      Write-Host ' - Instalar MySQL:   winget install -e --id Oracle.MySQL' -ForegroundColor DarkYellow
      Write-Host ' - Instalar Docker:  winget install -e --id Docker.DockerDesktop' -ForegroundColor DarkYellow
    }
  }
}

function Test-MySqlConnection([string]$DbHost,[int]$DbPort,[string]$DbUser,[string]$DbPass){
  $mysql = Find-MySqlExe
  if (-not $mysql){
    Warn 'mysql.exe/mysql no encontrado en PATH. Se omite validación activa y se continúa.'
    try {
      $client = New-Object System.Net.Sockets.TcpClient
      $iar = $client.BeginConnect($DbHost, $DbPort, $null, $null)
      if($iar.AsyncWaitHandle.WaitOne(1200,$false)){ $client.EndConnect($iar); $client.Close(); return $true }
      $client.Close(); return $false
    } catch { return $false }
  }
  $args = @('-N','-s','-e','SELECT 1;','-h', $DbHost,'-P', $DbPort,'-u', $DbUser)
  if ($DbPass -ne $null -and $DbPass -ne ''){ $args += "-p$DbPass" }
  try { & $mysql @args 1>$null 2>$null; return ($LASTEXITCODE -eq 0) } catch { return $false }
}

function Bootstrap(){
  Info 'Preparando bases de datos y seeds (bootstrap)'
  powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $Root 'scripts/qa/bootstrap.ps1')
  Ok 'Bootstrap completado'
}

# 1) PNPM check
Ensure-Pnpm

# 2) Prompt datos MySQL
Write-Host "Bienvenido al instalador interactivo de EPEM" -ForegroundColor Yellow
Write-Host "Ingresa los parámetros de tu base de datos MySQL (XAMPP u otra)." -ForegroundColor Yellow

$envPath = Join-Path $Root '.env'
$defaults = @{
  DATABASE_HOST = 'localhost'; DATABASE_PORT = '3306'; DATABASE_USER = 'root'; DATABASE_PASSWORD = ''
}
# Prefill desde .env (si existe) o desde ejemplos (.env.example*)
${existing} = @{}
try {
  if (Test-Path $envPath){
    $existing = Load-DotEnvFile $envPath
    foreach($k in $existing.Keys){ if ($defaults.ContainsKey($k)) { $defaults[$k] = $existing[$k] } }
  } else {
    $examples = @('.env.example','.env.prod.example','.env.staging.example') | ForEach-Object { Join-Path $Root $_ }
    foreach($ex in $examples){
      if (Test-Path $ex){
        $map = Load-DotEnvFile $ex
        foreach($k in $defaults.Keys){ if ($map[$k]) { $defaults[$k] = $map[$k] } }
        $existing = $map
        break
      }
    }
  }
} catch {}

# Paso previo: intentar ayudar a provisionar o arrancar MySQL
try { Interview-EnsureMySqlEngine ([ref]$defaults) } catch { Warn ("Entrevista de MySQL falló: " + $_.Exception.Message) }

$dbHost = Prompt-Value 'DB host' $defaults.DATABASE_HOST
$dbPort = Prompt-Value 'DB port' $defaults.DATABASE_PORT
$dbUser = Prompt-Value 'DB user' $defaults.DATABASE_USER
$dbPass = Read-Host -AsSecureString 'DB password (oculto, ENTER para vacío)'
$dbPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPass))
if ($null -eq $dbPassPlain) { $dbPassPlain = $defaults.DATABASE_PASSWORD }

# Validación de conexión MySQL (dos intentos)
$attempts = 0
while ($attempts -lt 2){
  $attempts++
  $okConn = Test-MySqlConnection -DbHost $dbHost -DbPort ([int]$dbPort) -DbUser $dbUser -DbPass $dbPassPlain
  if ($okConn){ Ok 'Conexión MySQL verificada'; break }
  Warn 'No fue posible conectar a MySQL con los datos provistos.'
  $retry = Read-Host 'Deseas reingresar los datos? (s/n)'
  if ($retry -match '^[sS]'){ $dbHost = Prompt-Value 'DB host' $dbHost; $dbPort = Prompt-Value 'DB port' $dbPort; $dbUser = Prompt-Value 'DB user' $dbUser; $dbPass = Read-Host -AsSecureString 'DB password (oculto)'; $dbPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($dbPass)); if ($null -eq $dbPassPlain) { $dbPassPlain='' } }
  else { break }
}
if (-not $okConn){ Warn 'Continuando sin validar activamente la conexión. El bootstrap intentará crear BDs igualmente.' }

# 3) Generar .env
$usersDb = 'epem_users'
$patientsDb = 'epem'
$catalogDb = 'epem_catalog'
$billingDb = 'epem_billing'

function Build-Url([string]$db){
  $cred = if ($dbPassPlain -and $dbPassPlain.Length -gt 0) { "$dbUser`:$dbPassPlain" } else { $dbUser }
  return "mysql://$cred@$dbHost`:$dbPort/$db"
}

$envMap = @{
  DATABASE_HOST = $dbHost
  DATABASE_PORT = $dbPort
  DATABASE_USER = $dbUser
  DATABASE_PASSWORD = $dbPassPlain

  USERS_SERVICE_DATABASE_URL = (Build-Url $usersDb)
  PATIENTS_SERVICE_DATABASE_URL = (Build-Url $patientsDb)
  CATALOG_SERVICE_DATABASE_URL = (Build-Url $catalogDb)
  BILLING_SERVICE_DATABASE_URL = (Build-Url $billingDb)

  JWT_SECRET = (Coalesce $existing['JWT_SECRET'] 'change-me')
  JWT_REFRESH_SECRET = (Coalesce $existing['JWT_REFRESH_SECRET'] 'change-me-too')
  ACCESS_TOKEN_TTL = (Coalesce $existing['ACCESS_TOKEN_TTL'] '900')
  REFRESH_TOKEN_TTL = (Coalesce $existing['REFRESH_TOKEN_TTL'] '604800')

  ADMIN_EMAIL = (Coalesce $existing['ADMIN_EMAIL'] 'admin@epem.local')
  ADMIN_PASSWORD = (Coalesce $existing['ADMIN_PASSWORD'] 'admin123')
  ADMIN_FIRST_NAME = (Coalesce $existing['ADMIN_FIRST_NAME'] 'Admin')
  ADMIN_LAST_NAME = (Coalesce $existing['ADMIN_LAST_NAME'] 'EPEM')

  API_GATEWAY_PORT = (Coalesce $existing['API_GATEWAY_PORT'] '4000')
  PATIENTS_SERVICE_PORT = (Coalesce $existing['PATIENTS_SERVICE_PORT'] '3010')
  USERS_SERVICE_PORT = (Coalesce $existing['USERS_SERVICE_PORT'] '3020')
  CATALOG_SERVICE_PORT = (Coalesce $existing['CATALOG_SERVICE_PORT'] '3030')
  BILLING_SERVICE_PORT = (Coalesce $existing['BILLING_SERVICE_PORT'] '3040')

  API_GATEWAY_URL = (Coalesce $existing['API_GATEWAY_URL'] 'http://localhost:4000')
  PATIENTS_SERVICE_URL = (Coalesce $existing['PATIENTS_SERVICE_URL'] 'http://localhost:3010')
  USERS_SERVICE_URL = (Coalesce $existing['USERS_SERVICE_URL'] 'http://localhost:3020')
  CATALOG_SERVICE_URL = (Coalesce $existing['CATALOG_SERVICE_URL'] 'http://localhost:3030')
  BILLING_SERVICE_URL = (Coalesce $existing['BILLING_SERVICE_URL'] 'http://localhost:3040')

  NEXT_PUBLIC_API_URL = (Coalesce $existing['NEXT_PUBLIC_API_URL'] 'http://localhost:4000')
  CORS_ORIGIN        = (Coalesce $existing['CORS_ORIGIN'] 'http://localhost:3000')
  DEFAULT_ORIGIN     = (Coalesce $existing['DEFAULT_ORIGIN'] 'http://localhost:3000')
  TRUSTED_PROXY_IPS = (Coalesce $existing['TRUSTED_PROXY_IPS'] '127.0.0.1,::1,::ffff:127.0.0.1')
}

# Preguntar por Prometheus local e instalación
$promChoice = 'n'
try {
  $promChoice = Read-Host '¿Deseas instalar y arrancar Prometheus local (9090) ahora? (s/n)'
  if ($promChoice -match '^[sS]'){
    $envMap['SKIP_PROMETHEUS_READY'] = 'false'
  } else {
    $envMap['SKIP_PROMETHEUS_READY'] = 'true'
  }
} catch {}

Write-Env $envMap

# 4) Install dependencias
if (-not $NoInstall){ Run-Install }

# 5) Bootstrap
if (-not $NoBootstrap){ Bootstrap }

# Promp opcional: compilar servicios ahora para garantizar dist correctos
try {
  $buildNow = Read-Host '¿Compilar servicios ahora (recomendado)? (s/n)'
  if ($buildNow -match '^[sS]'){
    Info 'Compilando monorepo (pnpm -r run build)'
    pnpm -r run build | Out-Null
    Ok 'Compilación completada'
  }
} catch {}

# Instalación/arranque de Prometheus si fue solicitado
function Wait-HttpOk([string]$url,[int]$timeoutSec=15){ $deadline=(Get-Date).AddSeconds($timeoutSec); while((Get-Date) -lt $deadline){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri $url -TimeoutSec 3; if ($r.StatusCode -ge 200 -and $r.StatusCode -lt 300){ return $true } } catch {}; Start-Sleep -Milliseconds 500 }; return $false }

function Install-PrometheusWindows([string]$dest){
  New-Item -Force -ItemType Directory -Path $dest | Out-Null
  $versions = @('2.55.0','2.54.1','2.53.1','2.52.0')
  $zipPath = Join-Path $env:TEMP ('prometheus-' + [Guid]::NewGuid().ToString() + '.zip')
  $ok = $false
  foreach($v in $versions){
    try {
      $url = "https://github.com/prometheus/prometheus/releases/download/v$($v)/prometheus-$($v).windows-amd64.zip"
      Info "Descargando Prometheus $v..."
      Invoke-WebRequest -Uri $url -OutFile $zipPath -UseBasicParsing -TimeoutSec 60
      Expand-Archive -Path $zipPath -DestinationPath $dest -Force
      Remove-Item $zipPath -Force -ErrorAction SilentlyContinue
      $ok = $true; break
    } catch { try { Remove-Item $zipPath -Force -ErrorAction SilentlyContinue } catch {} }
  }
  if (-not $ok){ Warn 'No se pudo descargar Prometheus automáticamente.'; return $false }
  $folder = Get-ChildItem $dest -Directory | Where-Object { $_.Name -like 'prometheus-*windows-amd64' } | Select-Object -First 1
  if (-not $folder){ Warn 'No se encontró carpeta descomprimida de Prometheus'; return $false }
  $bin = $folder.FullName
  $yml = @"
global:
  scrape_interval: 15s
scrape_configs:
  - job_name: 'users-service'
    metrics_path: /api/metrics/prometheus
    static_configs: [{ targets: ['127.0.0.1:3020'] }]
  - job_name: 'patients-service'
    metrics_path: /metrics/prometheus
    static_configs: [{ targets: ['127.0.0.1:3010'] }]
  - job_name: 'catalog-service'
    metrics_path: /metrics/prometheus
    static_configs: [{ targets: ['127.0.0.1:3030'] }]
  - job_name: 'billing-service'
    metrics_path: /metrics/prometheus
    static_configs: [{ targets: ['127.0.0.1:3040'] }]
  - job_name: 'gateway-aggregated'
    metrics_path: /analytics/prometheus
    static_configs: [{ targets: ['127.0.0.1:4000'] }]
"@
  Set-Content -Encoding UTF8 -Path (Join-Path $bin 'prometheus.yml') -Value $yml
  Info 'Iniciando Prometheus en 127.0.0.1:9090'
  Start-Process -FilePath (Join-Path $bin 'prometheus.exe') -ArgumentList @('--config.file=prometheus.yml','--web.listen-address=127.0.0.1:9090') -WorkingDirectory $bin -WindowStyle Hidden | Out-Null
  if (Wait-HttpOk -url 'http://localhost:9090/-/ready' -timeoutSec 20){ Ok 'Prometheus ready en :9090' } else { Warn 'Prometheus no respondió a tiempo'; return $false }
  return $true
}

if ($promChoice -match '^[sS]'){
  $dest = Join-Path $Root '.tools\prometheus'
  $instOk = $false
  try { $instOk = Install-PrometheusWindows -dest $dest } catch { $instOk = $false }
  if (-not $instOk){
    Warn 'Marcando SKIP_PROMETHEUS_READY=true por falta de Prometheus.'
    $envMap['SKIP_PROMETHEUS_READY'] = 'true'
    Write-Env $envMap
  }
}

Ok 'Instalación interactiva completada.'
Write-Host "Siguiente paso: ejecuta 'pnpm dev' para levantar la plataforma con QA." -ForegroundColor Yellow
