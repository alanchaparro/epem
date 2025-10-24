Param(
  [string]$RegistryPrefix,
  [string]$Tag = "latest",
  [string]$EnvFile = ".env.prod"
)

$ErrorActionPreference = 'Stop'
function Info($m){ Write-Host "[build] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[build] $m" -ForegroundColor Green }
function Err($m){ Write-Host "[build] $m" -ForegroundColor Red }

if (-not $RegistryPrefix) {
  $RegistryPrefix = Read-Host "Prefijo de imágenes (ej: docker.io/usuario o ghcr.io/org)"
}
if (-not $RegistryPrefix) { Err "Debes indicar un prefijo de imágenes"; exit 1 }

Info "Login en registry (puedes omitir si ya estás logueado)"
try { docker login ($RegistryPrefix.Split('/')[0]) } catch {}

Info "Construyendo imágenes (REGISTRY_PREFIX=$RegistryPrefix, IMAGE_TAG=$Tag)"
$env:REGISTRY_PREFIX = $RegistryPrefix
$env:IMAGE_TAG = $Tag
docker compose --env-file $EnvFile build

Info "Pushing imágenes"
docker compose --env-file $EnvFile push

Ok "Listo. Imágenes subidas con tag '$Tag' bajo '$RegistryPrefix'"

