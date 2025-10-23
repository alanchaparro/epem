param()
. "$PSScriptRoot/../qa/utils.ps1"

$results = @()

function Normalize-Ascii([string]$value) {
  if ($null -eq $value) { return $null }
  $formD = $value.Normalize([System.Text.NormalizationForm]::FormD)
  $chars = @()
  foreach ($ch in $formD.ToCharArray()) {
    $cat = [System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($ch)
    if ($cat -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) {
      $chars += $ch
    }
  }
  return -join $chars
}

function Wait-ForOrderStatus {
  param(
    [string]$Status,
    [string]$OrderId,
    [int]$Retries = 6,
    [int]$DelayMs = 500
  )
  for ($i = 0; $i -lt $Retries; $i++) {
    Start-Sleep -Milliseconds $DelayMs
    try {
      # Invoke-RestMethod devuelve un objeto plano si el arreglo tiene un solo elemento.
      # Se envuelve con @() para forzar siempre un arreglo y poder iterar sin errores.
      $orders = @(Invoke-RestMethod -Uri ("http://localhost:4000/orders?status=$Status") -TimeoutSec 10 -ErrorAction SilentlyContinue)
      if ($orders) {
        $match = ($orders | Where-Object { $_.id -eq $OrderId }).Count -gt 0
        if ($match) { return $true }
      }
    } catch {}
  }
  return $false
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
} catch {
  $results += Assert-True $false "Login devuelve accessToken" ($_.Exception.Message)
}

$token = if ($login) { $login.accessToken } else { $null }

# 3) Perfil /users/me
try {
  $me = Invoke-RestMethod -Uri 'http://localhost:4000/users/me' -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 10
  $results += Assert-Equal 'admin@epem.local' $me.email "Perfil /users/me email coincide"
} catch {
  $results += Assert-True $false "Perfil /users/me accesible" ($_.Exception.Message)
}

# 4) Listado de pacientes (sin filtro para evitar temas de colacion)
try {
  $list = Invoke-RestMethod -Uri 'http://localhost:4000/patients?skip=0&take=5' -TimeoutSec 10
  $results += Assert-True ($null -ne $list.items) "Listado de pacientes devuelve items" ($list.items.Count)
} catch {
  $results += Assert-True $false "Listado de pacientes" ($_.Exception.Message)
}

# 5) Alta y actualizacion de paciente
try {
  $dni = (Get-Date).ToString('HHmmssffff')
  $createBody = @{ dni = $dni; firstName = 'QA'; lastName = 'Tester'; birthDate = '1999-01-01' } | ConvertTo-Json
  $created = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/patients' -ContentType 'application/json' -Body $createBody -TimeoutSec 10
  $results += Assert-True ($null -ne $created.id) "Crear paciente devuelve id" $created.id
  $patchBody = @{ phone = '11-0000-0000' } | ConvertTo-Json
  $patched = Invoke-RestMethod -Method Patch -Uri "http://localhost:4000/patients/$($created.id)" -ContentType 'application/json' -Body $patchBody -TimeoutSec 10
  $results += Assert-Equal '11-0000-0000' $patched.phone "Patch de paciente actualiza phone"

  $dupOk = $false
  try {
    Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/patients' -ContentType 'application/json' -Body $createBody -TimeoutSec 10 -ErrorAction Stop | Out-Null
  } catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    $dupOk = ($statusCode -eq 409)
    $results += Assert-Equal 409 $statusCode "Crear paciente duplicado devuelve 409"
  }
  if (-not $dupOk) {
    $results += Assert-True $false "Crear paciente duplicado no debe devolver 2xx" $dupOk
  }
} catch {
  $results += Assert-True $false "Crear/Patch de paciente" ($_.Exception.Message)
}

# 6) Catalog-service (solo si responde health)
try {
  $catalogOk = $false
  try {
    $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3030/health' -TimeoutSec 15
    $catalogOk = ($r.StatusCode -eq 200)
  } catch {}
  $results += Assert-True $catalogOk "Catalog-service /health responde" ($catalogOk)

  if ($catalogOk) {
    $code = "QA" + (Get-Date).ToString('HHmmss')
    $createItem = @{ code = $code; name = 'Prestacion QA'; basePrice = 123.45 } | ConvertTo-Json
    $item = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/catalog/items' -ContentType 'application/json' -Body $createItem -TimeoutSec 10
    $results += Assert-True ($null -ne $item.id) "Crear prestacion devuelve id" $item.id

    $updateItem = @{ name = 'Prestacion QA Edit'; basePrice = 150.25 } | ConvertTo-Json
    $patchedItem = Invoke-RestMethod -Method Patch -Uri ("http://localhost:4000/catalog/items/$($item.id)") -ContentType 'application/json' -Body $updateItem -TimeoutSec 10
    $results += Assert-Equal 'Prestacion QA Edit' $patchedItem.name "Editar prestacion actualiza nombre" ($patchedItem.name)

    $dupPayload = @{ code = $code; name = 'Prestacion duplicada'; basePrice = 50 } | ConvertTo-Json
    $dupStatus = $null
    try {
      Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/catalog/items' -ContentType 'application/json' -Body $dupPayload -TimeoutSec 10 -ErrorAction Stop | Out-Null
    } catch {
      $dupStatus = $_.Exception.Response.StatusCode.Value__
      $results += Assert-Equal 409 $dupStatus "Crear prestacion duplicada devuelve 409"
    }
    if ($dupStatus -ne 409) {
      $results += Assert-True $false "Crear prestacion duplicada no debe devolver 2xx" $dupStatus
    }

    # Billing: aseguradoras, coberturas, ordenes, autorizaciones e invoices
    $insurerPayload = @{ name = 'Obra Social QA'; planCode = "QA-$code" } | ConvertTo-Json
    $insurer = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/billing/insurers' -ContentType 'application/json' -Body $insurerPayload -TimeoutSec 10
    $results += Assert-True ($null -ne $insurer.id) "Crear aseguradora devuelve id" $insurer.id

    $updateInsurer = @{ active = $false } | ConvertTo-Json
    $insurer2 = Invoke-RestMethod -Method Patch -Uri ("http://localhost:4000/billing/insurers/$($insurer.id)") -ContentType 'application/json' -Body $updateInsurer -TimeoutSec 10
    $results += Assert-True ((-not $insurer2.active) -eq $true) "Actualizar aseguradora cambia active" ($insurer2.active)

    $coveragePayload = @{
      insurerId    = $insurer.id
      serviceItemId = 'LAB01'
      copay        = 456.78
      requiresAuth = $true
    } | ConvertTo-Json
    $coverage = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/billing/coverage' -ContentType 'application/json' -Body $coveragePayload -TimeoutSec 10
    $results += Assert-True ($null -ne $coverage.id) "Crear cobertura devuelve id" $coverage.id

    $updateCoverage = @{ copay = 500; requiresAuth = $false } | ConvertTo-Json
    $coverage2 = Invoke-RestMethod -Method Patch -Uri ("http://localhost:4000/billing/coverage/$($coverage.id)") -ContentType 'application/json' -Body $updateCoverage -TimeoutSec 10
    $results += Assert-Equal 500 ([int][double]$coverage2.copay) "Editar cobertura actualiza copago" ($coverage2.copay)
    $results += Assert-True (-not [bool]$coverage2.requiresAuth) "Editar cobertura actualiza requiresAuth" ($coverage2.requiresAuth)

    # Ordenes + autorizaciones
    $orderBody = @{
      patientId    = $created.id
      serviceItemId = 'LAB01'
      insurerId    = $insurer.id
      requiresAuth = $true
    } | ConvertTo-Json
    $order = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/orders' -ContentType 'application/json' -Body $orderBody -TimeoutSec 10
    $results += Assert-Equal 'PENDING' $order.status "Crear orden con requiereAuth deja status PENDING" ($order.status)

    $orderListed = Wait-ForOrderStatus -Status 'PENDING' -OrderId $order.id
    $results += Assert-True $orderListed "Listado de ordenes incluye orden pendiente" $orderListed

    $authList = @(Invoke-RestMethod -Uri 'http://localhost:4000/billing/authorizations?status=PENDING' -TimeoutSec 10)
    $auth = $authList | Where-Object { $_.orderId -eq $order.id } | Select-Object -First 1
    if ($auth) {
      $results += Assert-True $true "Se creo autorizacion vinculada a la orden" $auth.id
      $approveBody = @{ status = 'APPROVED'; authCode = 'AUTHQA' } | ConvertTo-Json
      $authUpdated = Invoke-RestMethod -Method Patch -Uri "http://localhost:4000/billing/authorizations/$($auth.id)" -ContentType 'application/json' -Body $approveBody -TimeoutSec 10
      $results += Assert-Equal 'APPROVED' $authUpdated.status "Aprobar autorizacion actualiza status" ($authUpdated.status)

      $inProgress = Wait-ForOrderStatus -Status 'IN_PROGRESS' -OrderId $order.id
      $results += Assert-True $inProgress "Orden pasa a IN_PROGRESS tras aprobacion" $inProgress

      $completeBody = @{ status = 'COMPLETED' } | ConvertTo-Json
      $orderCompleted = Invoke-RestMethod -Method Patch -Uri "http://localhost:4000/orders/$($order.id)/status" -ContentType 'application/json' -Body $completeBody -TimeoutSec 10
      $results += Assert-Equal 'COMPLETED' $orderCompleted.status "Completar orden actualiza status" ($orderCompleted.status)

      $invoiceBody = @{ orderId = $order.id } | ConvertTo-Json
      $invoice = Invoke-RestMethod -Method Post -Uri 'http://localhost:4000/billing/invoices' -ContentType 'application/json' -Body $invoiceBody -TimeoutSec 10
      $results += Assert-Equal 'DRAFT' $invoice.status "Crear factura deja status DRAFT" ($invoice.status)
      $results += Assert-True ($null -ne $invoice.total) "Factura calcula total" ($invoice.total)

      $draftList = @(Invoke-RestMethod -Uri 'http://localhost:4000/billing/invoices?status=DRAFT' -TimeoutSec 10)
      $draftFound = ($draftList | Where-Object { $_.id -eq $invoice.id }).Count -gt 0
      $results += Assert-True $draftFound "Listado de facturas incluye factura en DRAFT" $draftFound

      $invoiceIssued = Invoke-RestMethod -Method Patch -Uri "http://localhost:4000/billing/invoices/$($invoice.id)/issue" -ContentType 'application/json' -TimeoutSec 10
      $results += Assert-Equal 'ISSUED' $invoiceIssued.status "Emitir factura actualiza estado" ($invoiceIssued.status)
      $results += Assert-True ($null -ne $invoiceIssued.issuedAt) "Emitir factura setea issuedAt" ($invoiceIssued.issuedAt)
    } else {
      $results += Assert-True $false "Se creo autorizacion vinculada a la orden" 'No se encontro autorizacion vinculada'
    }
  }
} catch {
  $results += Assert-True $false "Billing CRUD" ($_.Exception.Message)
}

New-Item -Force -ItemType Directory -Path "$PSScriptRoot/../../docs/qa" | Out-Null
Save-Report -Results $results -JsonPath "$PSScriptRoot/../../docs/qa/back-results.json" -MarkdownPath "$PSScriptRoot/../../docs/qa/back-report.md"
Write-Host "Back QA terminado. Ver docs/qa/back-report.md" -ForegroundColor Green
