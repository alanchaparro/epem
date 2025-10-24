#!/usr/bin/env bash
set -euo pipefail

REGISTRY_PREFIX="${1:-}"
TAG="${2:-latest}"
ENV_FILE="${3:-.env.prod}"

log(){ printf "[build] %s\n" "$*"; }
err(){ printf "\033[31m[build] %s\033[0m\n" "$*"; }

if [[ -z "$REGISTRY_PREFIX" ]]; then
  read -rp "Prefijo de imágenes (ej: docker.io/usuario o ghcr.io/org): " REGISTRY_PREFIX || true
fi
if [[ -z "$REGISTRY_PREFIX" ]]; then err "Debes indicar un prefijo de imágenes"; exit 1; fi

log "Login en registry (puedes omitir si ya estás logueado)"
docker login "${REGISTRY_PREFIX%%/*}" || true

export REGISTRY_PREFIX="$REGISTRY_PREFIX"
export IMAGE_TAG="$TAG"
log "Construyendo imágenes (REGISTRY_PREFIX=$REGISTRY_PREFIX, IMAGE_TAG=$IMAGE_TAG)"
docker compose --env-file "$ENV_FILE" build

log "Pushing imágenes"
docker compose --env-file "$ENV_FILE" push

log "Listo. Imágenes subidas con tag '$IMAGE_TAG' bajo '$REGISTRY_PREFIX'"

