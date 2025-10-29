#!/usr/bin/env bash
set -euo pipefail

# quickstart for Linux/VPS: bring up full dev stack via Docker Compose
# - Ensures .env.prod exists (generates random DATABASE_PASSWORD/JWT secrets if missing)
# - Starts MySQL + services + web using compose (dev overlay)
# - Waits for health endpoints
# - Writes credentials/help to .tmp/dev-linux-info.txt (suggested to delete after use)

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

info()  { echo -e "\e[36m[dev:linux]\e[0m $*"; }
ok()    { echo -e "\e[32m[dev:linux]\e[0m $*"; }
warn()  { echo -e "\e[33m[dev:linux]\e[0m $*"; }
error() { echo -e "\e[31m[dev:linux]\e[0m $*" 1>&2; }

need_cmd() { command -v "$1" >/dev/null 2>&1 || { error "Falta dependencia: $1"; exit 1; }; }

# prefer 'docker compose', fallback to 'docker-compose'
COMPOSE=(docker compose)
if ! docker compose version >/dev/null 2>&1; then
  if command -v docker-compose >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
  else
    error "Docker Compose no encontrado. Instala Docker (con compose)."; exit 1
  fi
fi

need_cmd docker

ENV_FILE=".env.prod"
ENV_EXAMPLE=".env.prod.example"

mkdir -p .tmp

generate_secret() {
  # 48 bytes base64 without trailing '='
  openssl rand -base64 48 | tr -d '=' | tr -d '\n'
}

generate_password() {
  # 16 bytes base64 safe
  openssl rand -base64 24 | tr -d '=\n' | cut -c1-24
}

ensure_env_file() {
  if [[ ! -f "$ENV_FILE" ]]; then
    info "Creando $ENV_FILE desde $ENV_EXAMPLE"
    if [[ -f "$ENV_EXAMPLE" ]]; then
      cp "$ENV_EXAMPLE" "$ENV_FILE"
    else
      error "No se encuentra $ENV_EXAMPLE para inicializar variables."; exit 1
    fi
  fi

  # Ensure DATABASE_PASSWORD
  if ! grep -q '^DATABASE_PASSWORD=' "$ENV_FILE"; then
    info "Agregando DATABASE_PASSWORD..."
    echo "DATABASE_PASSWORD=$(generate_password)" >> "$ENV_FILE"
  else
    current_pw=$(grep '^DATABASE_PASSWORD=' "$ENV_FILE" | head -n1 | cut -d'=' -f2-)
    if [[ -z "$current_pw" || "$current_pw" == "changeme" ]]; then
      new_pw=$(generate_password)
      info "Seteando DATABASE_PASSWORD aleatorio"
      sed -i.bak "s/^DATABASE_PASSWORD=.*/DATABASE_PASSWORD=${new_pw}/" "$ENV_FILE"
    fi
  fi

  # Ensure JWT secrets
  for key in JWT_SECRET JWT_REFRESH_SECRET; do
    if ! grep -q "^$key=" "$ENV_FILE"; then
      echo "$key=$(generate_secret)" >> "$ENV_FILE"
    else
      val=$(grep "^$key=" "$ENV_FILE" | head -n1 | cut -d'=' -f2-)
      if [[ -z "$val" || "$val" == please-set-* ]]; then
        sed -i.bak "s/^$key=.*/$key=$(generate_secret)/" "$ENV_FILE"
      fi
    fi
  done
}

write_info_file() {
  local out=".tmp/dev-linux-info.txt"
  local db_pass db_user
  db_pass=$(grep '^DATABASE_PASSWORD=' "$ENV_FILE" | head -n1 | cut -d'=' -f2-)
  db_user="root"

  cat > "$out" <<EOF
EPEM - Información de acceso (Linux dev compose)
Fecha: $(date -Iseconds)

IMPORTANTE: Este archivo contiene credenciales sensibles. Copia estos datos a un gestor seguro y elimina este archivo.

MySQL (host)
- Usuario: ${db_user}
- Password: ${db_pass}
- Host: localhost
- Puerto: 3306

Conexiones útiles (host):
- users:   mysql://root:${db_pass}@localhost:3306/epem_users
- patients:mysql://root:${db_pass}@localhost:3306/epem
- catalog: mysql://root:${db_pass}@localhost:3306/epem_catalog
- billing: mysql://root:${db_pass}@localhost:3306/epem_billing

Servicios (puertos locales):
- Web (Next dev): http://localhost:3000
- API Gateway:    http://localhost:4000

Notas:
- Dentro de la red Docker el host de MySQL es "mysql".
- Variables en ${ENV_FILE} controlan puertos y URLs internas.

Sugerencia: Elimina este archivo tras guardar las credenciales: rm ${out}
EOF
  chmod 600 "$out" || true
  ok "Credenciales escritas en $out (eliminar después de usar)."
}

wait_http_ok() {
  local url="$1"; local timeout="${2:-180}"; local start now
  start=$(date +%s)
  while true; do
    if command -v curl >/dev/null 2>&1; then
      code=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" || true)
      [[ "$code" =~ ^2[0-9][0-9]$ ]] && return 0
    elif command -v wget >/dev/null 2>&1; then
      wget -q --spider "$url" && return 0 || true
    fi
    now=$(date +%s)
    if (( now - start > timeout )); then return 1; fi
    sleep 0.5
  done
}

main() {
  info "Chequeando Docker..."
  docker version >/dev/null || { error "Docker no disponible"; exit 1; }

  ensure_env_file
  write_info_file

  info "Levantando stack (compose dev overlay)"
  "${COMPOSE[@]}" -f docker-compose.yml -f docker-compose.dev.yml --env-file "$ENV_FILE" up -d \
    mysql pnpm-install users-service patients-service catalog-service billing-service api-gateway web

  info "Esperando health de gateway (4000) y web (3000)"
  if ! wait_http_ok "http://localhost:4000/health" 240; then warn "Gateway no respondió 200 a tiempo"; fi
  if ! wait_http_ok "http://localhost:3000/login" 240; then warn "Web no respondió 200 a tiempo"; fi

  ok "Listo. Usa 'pnpm deploy:check' para un QA rápido."
}

main "$@"

