param(
  [switch]$Deep
)

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "Cleaning generated artifacts..." -ForegroundColor Cyan

# Frontend caches
@(
  'apps/web/.next',
  'apps/web/test-results'
) | ForEach-Object { if (Test-Path $_) { Remove-Item -Recurse -Force $_ } }

# Service build outputs
Get-ChildItem -Path 'services' -Directory -Recurse -Filter 'dist' |
  ForEach-Object { Remove-Item -Recurse -Force $_.FullName }

# Library builds
@(
  'libs/**/dist'
) | ForEach-Object { Get-ChildItem -Path $_ -Directory -Recurse | ForEach-Object { Remove-Item -Recurse -Force $_.FullName } }

# Stray compiled files inside src of shared lib
if (Test-Path 'libs/nest-common/src') {
  Get-ChildItem 'libs/nest-common/src' -Recurse -Include *.js,*.d.ts |
    ForEach-Object { Remove-Item -Force $_.FullName }
}

# Root temp/cache
@(
  '.tmp',
  '.turbo',
  '.parcel-cache',
  '.vite'
) | ForEach-Object { if (Test-Path $_) { Remove-Item -Recurse -Force $_ } }

if ($Deep) {
  Write-Host "Deep clean: removing node_modules and root dist" -ForegroundColor Yellow
  Get-ChildItem -Path . -Recurse -Directory -Filter node_modules |
    ForEach-Object { Remove-Item -Recurse -Force $_.FullName }
  if (Test-Path 'dist') { Remove-Item -Recurse -Force 'dist' }
}

Write-Host "Cleanup completed." -ForegroundColor Green

