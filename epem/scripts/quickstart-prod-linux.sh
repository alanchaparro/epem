#!/usr/bin/env bash
set -euo pipefail

# Quickstart para Producción-like en Linux/VPS
# - Usa docker-compose.yml (nginx reverse proxy en 8080)
# - Asegura .env.prod con secretos seguros
# - Opción --with-obs para Prometheus/Grafana
# - Espera health y genera archivo con credenciales sensibles (.tmp/prod-linux-info.txt)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

WITH_OBS="false"
ENV_FILE=".env.prod"
TIMEOUT_SEC=240
NO_BOOTSTRAP="false"

info(){ echo -e "\e[36m[prod:linux]\e[0m $*"; }
ok(){ echo -e "\e[32m[prod:linux]\e[0m $*"; }
warn(){ echo -e "\e[33m[prod:linux]\e[0m $*"; }
err(){ echo -e "\e[31m[prod:linux]\e[0m $*" 1>&2; }

usage(){
  cat <<EOF
Uso: bash scripts/quickstart-prod-linux.sh [--with-obs] [--env-file .env.prod] [--no-bootstrap] [--timeout 240]
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --with-obs) WITH_OBS="true"; shift;;
    --env-file) ENV_FILE="${2:-.env.prod}"; shift 2;;
    --no-bootstrap) NO_BOOTSTRAP="true"; shift;;
    --timeout) TIMEOUT_SEC="${2:-240}"; shift 2;;
    -h|--help) usage; exit 0;;
    *) warn "Argumento desconocido: $1"; shift;;
  esac
done

need_cmd(){ command -v "$1" >/dev/null 2>&1 || { err "Falta dependencia: $1"; exit 1; }; }
need_cmd docker

COMPOSE=(docker compose)
if ! docker compose version >/dev/null 2>&1; then
  if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
  else
    err "Docker Compose no encontrado."; exit 1
  fi
fi

mkdir -p .tmp

gen_secret(){ openssl rand -base64 48 | tr -d '=\n'; }
gen_password(){ openssl rand -base64 24 | tr -d '=\n' | cut -c1-24; }

ensure_env(){
  if [[ ! -f "$ENV_FILE" ]]; then
    if [[ -f .env.prod.example ]]; then
      info "Creando $ENV_FILE desde .env.prod.example"
      cp .env.prod.example "$ENV_FILE"
    else
      err "No existe $ENV_FILE ni .env.prod.example"; exit 1
    fi
  fi

  if ! grep -q '^DATABASE_PASSWORD=' "$ENV_FILE"; then
    echo "DATABASE_PASSWORD=$(gen_password)" >> "$ENV_FILE"
  else
    pw=$(grep '^DATABASE_PASSWORD=' "$ENV_FILE" | head -n1 | cut -d'=' -f2-)
    if [[ -z "$pw" || "$pw" == "changeme" ]]; then
      sed -i.bak "s/^DATABASE_PASSWORD=.*/DATABASE_PASSWORD=$(gen_password)/" "$ENV_FILE"
    fi
  fi

  for k in JWT_SECRET JWT_REFRESH_SECRET; do
    if ! grep -q "^$k=" "$ENV_FILE"; then
      echo "$k=$(gen_secret)" >> "$ENV_FILE"
    else
      v=$(grep "^$k=" "$ENV_FILE" | head -n1 | cut -d'=' -f2-)
      if [[ -z "$v" || "$v" == please-set-* ]]; then
        sed -i.bak "s/^$k=.*/$k=$(gen_secret)/" "$ENV_FILE"
      fi
    fi
  done
}

write_info(){
  local out=".tmp/prod-linux-info.txt"
  local db_pass gf_user gf_pass
  db_pass=$(grep '^DATABASE_PASSWORD=' "$ENV_FILE" | head -n1 | cut -d'=' -f2-)
  gf_user=$(grep '^GF_SECURITY_ADMIN_USER=' "$ENV_FILE" | head -n1 | cut -d'=' -f2- || echo "admin")
  gf_pass=$(grep '^GF_SECURITY_ADMIN_PASSWORD=' "$ENV_FILE" | head -n1 | cut -d'=' -f2- || echo "admin")
  cat > "$out" <<EOF
EPEM - Producción (Linux/VPS) - Información sensible
Fecha: $(date -Iseconds)

IMPORTANTE: Este archivo contiene credenciales. Guarda en un gestor seguro y ELIMÍNALO.

MySQL
- Usuario: root
- Password: ${db_pass}
- Host: localhost (en host) / mysql (dentro de Docker)
- Puerto: 3306

Endpoints
- Web (NGINX):      http://localhost:8080
- API Gateway:      http://localhost:4000
$( [[ "$WITH_OBS" == "true" ]] && echo "- Prometheus:        http://localhost:9090" )
$( [[ "$WITH_OBS" == "true" ]] && echo "- Grafana:           http://localhost:3001 (user: ${gf_user}, pass: ${gf_pass})" )

Sugerencia: rm ${out}
EOF
  chmod 600 "$out" || true
  ok "Credenciales escritas en $out (eliminar tras usarlas)"
}

wait_http_ok(){
  local url="$1"; local timeout="${2:-180}"; local start=$(date +%s)
  while true; do
    if curl -fsS "$url" >/dev/null 2>&1; then return 0; fi
    local now=$(date +%s)
    if (( now - start > timeout )); then return 1; fi
    sleep 0.5
  done
}

maybe_bootstrap(){
  if [[ "$NO_BOOTSTRAP" == "true" ]]; then return 0; fi
  info "Bootstrap de BDs y seeds (contenedores)"
  if [[ -x ops/docker/bootstrap.sh ]]; then
    bash ops/docker/bootstrap.sh || warn "Bootstrap devolvió error (continuo)"
  else
    warn "No se encontró ops/docker/bootstrap.sh ejecutable"
  fi
}

main(){
  info "Preparando entorno ($ENV_FILE)"
  ensure_env
  write_info

  maybe_bootstrap

  info "Levantando stack base (nginx en 8080)"
  "${COMPOSE[@]}" --env-file "$ENV_FILE" up -d mysql users-service patients-service catalog-service billing-service api-gateway web nginx

  if [[ "$WITH_OBS" == "true" ]]; then
    info "Levantando observabilidad (Prometheus + Grafana)"
    "${COMPOSE[@]}" --env-file "$ENV_FILE" up -d prometheus grafana
  fi

  info "Esperando health: gateway y web (nginx)"
  if ! wait_http_ok "http://localhost:4000/health" "$TIMEOUT_SEC"; then warn "Gateway no respondió 200 a tiempo"; fi
  if ! wait_http_ok "http://localhost:8080/login" "$TIMEOUT_SEC"; then warn "Web no respondió 200 a tiempo"; fi

  info "QA smoke (no bloqueante)"
  export WEB_URL="http://localhost:8080"
  node scripts/qa/test-back.js >/dev/null 2>&1 || true
  node scripts/qa/test-front.js >/dev/null 2>&1 || true

  ok "Stack arriba. Web: http://localhost:8080  API: http://localhost:4000"
  if [[ "$WITH_OBS" == "true" ]]; then
    ok "Observabilidad activa: Prometheus 9090, Grafana 3001"
  fi
}

main "$@"

