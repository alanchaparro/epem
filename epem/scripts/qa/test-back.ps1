param()
. "$PSScriptRoot/../qa/utils.ps1"

$results = @()

function Normalize-Ascii([string]$s) {
  if ($null -eq $s) { return $null }
  $formD = $s.Normalize([System.Text.NormalizationForm]::FormD)
  $chars = @()
  foreach ($ch in $formD.ToCharArray()) {
    $cat = [System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
    if ($cat -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) { $chars += $ch }
  }
  return -join $chars
}

# 1) Health checks
$results += Assert-True (Wait-HttpOk -Url 'http://localhost:4000/health' -TimeoutSec 15) "Gateway /health responde" "http://localhost:4000/health"
$results += Assert-True (Wait-HttpOk -Url 'http://localhost:3020/api/health' -TimeoutSec 15) "Users-service /api/health responde" "http://localhost:3020/api/health"
$results += Assert-True (Wait-HttpOk -Url 'http://localhost:3010/health' -TimeoutSec 15) "Patients-service /health responde" "http://localhost:3010/health"

# 2) Login
$loginBody = @{ email = 'admin@epem.local'; password = 'admin123' } | ConvertTo-Json
try {
  $login = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/auth/login' -ContentType 'application/json' -Body $loginBody -TimeoutSec 10
  $hasToken = [bool]$login.accessToken
  $tokenDisplay = if ($hasToken) { '[REDACTED]' } else { $login.accessToken }
  $results += Assert-True $hasToken "Login devuelve accessToken" $tokenDisplay
} catch { $results += Assert-True $false "Login devuelve accessToken" ($_.Exception.Message) }

$token = if ($login) { $login.accessToken } else { $null }

# 3) Perfil /users/me
try {
  $me = Invoke-RestMethod -Uri 'http://localhost:4000/users/me' -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 10
  $results += Assert-Equal 'admin@epem.local' $me.email "Perfil /users/me email coincide"
} catch { $results += Assert-True $false "Perfil /users/me accesible" ($_.Exception.Message) }

# 4) Patients list (sin filtro para evitar dependencias de colación)
try {
  $list = Invoke-RestMethod -Uri 'http://localhost:4000/patients?skip=0&take=5' -TimeoutSec 10
  $results += Assert-True ($null -ne $list.items) "Listado de pacientes devuelve items" ($list.items.Count)
} catch { $results += Assert-True $false "Listado de pacientes" ($_.Exception.Message) }

# 5) Create + Patch patient
try {
  $dni = (Get-Date).ToString('HHmmssffff')
  $createBody = @{ dni = $dni; firstName = 'QA'; lastName = 'Tester'; birthDate = '1999-01-01' } | ConvertTo-Json
  $created = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/patients' -ContentType 'application/json' -Body $createBody -TimeoutSec 10
  $results += Assert-True ($null -ne $created.id) "Crear paciente devuelve id" $created.id
  $patchBody = @{ phone = '11-0000-0000' } | ConvertTo-Json
  $patched = Invoke-RestMethod -Method Patch -Uri "http://localhost:4000/patients/$($created.id)" -ContentType 'application/json' -Body $patchBody -TimeoutSec 10
$results += Assert-Equal '11-0000-0000' $patched.phone "Patch de paciente actualiza phone"
  # Duplicate DNI should NOT be 500; expected 409/400
  $dupOk = $false
  try {
    $dup = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/patients' -ContentType 'application/json' -Body $createBody -TimeoutSec 10 -ErrorAction Stop
  } catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $dupOk = ($statusCode -eq 409)
    $results += Assert-Equal 409 $statusCode "Crear paciente duplicado devuelve 409"
  }
  if (-not $dupOk) {
    $results += Assert-True $false "Crear paciente duplicado no debe devolver 2xx" $dupOk
  }
} catch { $results += Assert-True $false "Crear/Patch de paciente" ($_.Exception.Message) }

# 6) Catalog-service (opcional si está listo)
try {
  # Health directo al servicio (espera ampliada)
  $okCat = $false
  try { $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3030/health' -TimeoutSec 15; $okCat = ($r.StatusCode -eq 200) } catch {}
  $results += Assert-True $okCat "Catalog-service /health responde" ($okCat)
  if ($okCat) {
    $code = "QA" + (Get-Date).ToString('HHmmss');
    $createItem = @{ code=$code; name='Prestación QA'; basePrice=123.45 } | ConvertTo-Json
    $item = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/catalog/items' -ContentType 'application/json' -Body $createItem -TimeoutSec 10
    $results += Assert-True ($null -ne $item.id) "Crear prestación devuelve id" $item.id
    $patchItem = @{ name='Prestacion QA Edit'; active=$false } | ConvertTo-Json
    $item2 = Invoke-RestMethod -Method Patch -Uri ("http://localhost:4000/catalog/items/" + $item.id) -ContentType 'application/json' -Body $patchItem -TimeoutSec 10
    $expectedName = 'Prestacion QA Edit'
    $results += Assert-Equal $expectedName $item2.name "Editar prestación actualiza nombre"
    # duplicado code → 409
    try { $dup = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/catalog/items' -ContentType 'application/json' -Body $createItem -TimeoutSec 10 -ErrorAction Stop }
    catch { $sc = $_.Exception.Response.StatusCode.Value__; $results += Assert-Equal 409 $sc "Crear prestación duplicada devuelve 409" }
  }
} catch { $results += Assert-True $false "Catálogo CRUD" ($_.Exception.Message) }

New-Item -Force -ItemType Directory -Path "$PSScriptRoot/../../docs/qa" | Out-Null
Save-Report -Results $results -JsonPath "$PSScriptRoot/../../docs/qa/back-results.json" -MarkdownPath "$PSScriptRoot/../../docs/qa/back-report.md"
Write-Host "Back QA terminado. Ver docs/qa/back-report.md" -ForegroundColor Green
