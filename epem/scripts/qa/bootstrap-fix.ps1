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

function Fix-CatalogSchemaUtf8 {
  param([string]$Root)
  $schemaPath = Join-Path $Root 'services/catalog-service/prisma/schema.prisma'
  $content = @'
generator client {
  provider = "prisma-client-js"
  output   = "../generated/client"
  binaryTargets = ["native", "debian-openssl-3.0.x", "windows"]
}

datasource db {
  provider = "mysql"
  url      = env("CATALOG_SERVICE_DATABASE_URL")
}

model ServiceItem {
  id          String   @id @default(uuid())
  code        String   @unique
  name        String
  description String?
  basePrice   Decimal  @db.Decimal(10,2)
  active      Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
'@
  # Escribe en UTF-8 sin BOM para evitar P1012 por caracteres invisibles
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($schemaPath, $content, $utf8NoBom)
}

function Remove-PrismaEngine {
  param([string]$ServicePath)
  $engine = Join-Path $ServicePath 'generated/client/query_engine-windows.dll.node'
  if (Test-Path $engine) { try { Remove-Item -Force $engine -ErrorAction SilentlyContinue } catch {} }
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

$root = Resolve-Path "$PSScriptRoot/../.." | ForEach-Object { $_.Path }
$envs = Load-DotEnv -Path (Join-Path $root '.env')

# 1) Arregla schema del catálogo (UTF-8)
Fix-CatalogSchemaUtf8 -Root $root

# 2) Mitiga EPERM del engine en patients-service
Remove-PrismaEngine -ServicePath (Join-Path $root 'services/patients-service')

# 3) Ejecuta bootstrap base (db push sin seeds)
powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'bootstrap.ps1') -NoSeeds

# 4) Genera clientes Prisma con retry (Windows)
Invoke-PrismaGenerateWithRetry -ServicePath (Join-Path $root 'services/patients-service')
Invoke-PrismaGenerateWithRetry -ServicePath (Join-Path $root 'services/catalog-service')

# 5) Seeds (después de generate)
if (-not $NoSeeds) {
  Write-Host 'Seeds iniciales (admin, pacientes, catálogo)' -ForegroundColor Green
  pnpm --filter @epem/users-service seed:admin
  pnpm --filter @epem/patients-service seed:patients
  pnpm --filter @epem/catalog-service seed:items
}

Write-Host 'Bootstrap-fix completado.' -ForegroundColor Green
