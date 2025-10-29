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
  TRUSTED_PROXY_IPS = (Coalesce $existing['TRUSTED_PROXY_IPS'] '127.0.0.1,::1,::ffff:127.0.0.1')
}

Write-Env $envMap

# 4) Install dependencias
if (-not $NoInstall){ Run-Install }

# 5) Bootstrap
if (-not $NoBootstrap){ Bootstrap }

Ok 'Instalación interactiva completada.'
Write-Host "Siguiente paso: ejecuta 'pnpm dev' para levantar la plataforma con QA." -ForegroundColor Yellow
