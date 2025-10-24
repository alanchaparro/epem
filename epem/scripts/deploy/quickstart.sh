#!/usr/bin/env bash
set -euo pipefail

ENV_FILE=".env.prod"
NO_BOOTSTRAP="false"
TIMEOUT_SEC=180

log_info(){ printf "[deploy] %s\n" "$*"; }
log_ok(){ printf "\033[32m[deploy] %s\033[0m\n" "$*"; }
log_warn(){ printf "\033[33m[deploy] %s\033[0m\n" "$*"; }
log_err(){ printf "\033[31m[deploy] %s\033[0m\n" "$*"; }

usage(){
  cat <<EOF
Usage: bash scripts/deploy/quickstart.sh [--no-bootstrap] [--env-file .env.prod] [--timeout 180]
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-bootstrap) NO_BOOTSTRAP="true"; shift;;
    --env-file) ENV_FILE="${2:-.env.prod}"; shift 2;;
    --timeout) TIMEOUT_SEC="${2:-180}"; shift 2;;
    -h|--help) usage; exit 0;;
    *) log_warn "Argumento desconocido: $1"; shift;;
  esac
done

wait_http_ok(){
  local url="$1"; local timeout="${2:-60}"; local t=0
  while (( t < timeout )); do
    if curl -fsS "$url" >/dev/null 2>&1; then return 0; fi
    sleep 0.5; t=$((t+1))
  done
  return 1
}

log_info "Quickstart de despliegue (Compose)"

if ! command -v docker >/dev/null 2>&1; then log_err "Docker no está instalado o no está en PATH"; exit 1; fi

if [[ ! -f "$ENV_FILE" ]]; then
  if [[ -f ".env.prod.example" ]]; then
    cp .env.prod.example "$ENV_FILE"
    log_warn "Se creó $ENV_FILE desde .env.prod.example. Revisa secretos/URLs (valores por defecto inseguros para prod)."
  else
    log_err "No existe $ENV_FILE ni .env.prod.example. Aborta."
    exit 1
  fi
fi

if [[ "$NO_BOOTSTRAP" != "true" ]]; then
  log_info "Bootstrap de BDs y seeds..."
  if [[ -x "ops/docker/bootstrap.sh" ]]; then
    bash ops/docker/bootstrap.sh
  else
    log_warn "ops/docker/bootstrap.sh no es ejecutable; intentando con bash"
    bash ops/docker/bootstrap.sh || true
  fi
fi

log_info "Levantando stack con Compose..."
docker compose --env-file "$ENV_FILE" up -d

log_info "Esperando servicios (gateway/web)..."
if ! wait_http_ok "http://localhost:4000/health" 90; then log_err "Gateway no respondió 200 en /health"; fi
if ! wait_http_ok "http://localhost:8080/login" 90; then log_err "Web no respondió 200 en /login"; fi

log_info "Ejecutando QA de smoke..."
export WEB_URL="http://localhost:8080"
node scripts/qa/test-back.js >/dev/null 2>&1 || true
node scripts/qa/test-front.js >/dev/null 2>&1 || true

back_line=$(grep -m1 "Resultado" docs/qa/back-report.md || true)
front_line=$(grep -m1 "Resultado" docs/qa/front-report.md || true)

if echo "$back_line" | grep -q PASS && echo "$front_line" | grep -q PASS; then
  log_ok "QA PASS. Web: http://localhost:8080  API: http://localhost:4000"
  exit 0
else
  log_err "QA FAIL. Revisa docs/qa/back-report.md y docs/qa/front-report.md"
  exit 2
fi

