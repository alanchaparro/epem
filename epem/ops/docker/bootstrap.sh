#!/usr/bin/env bash
set -euo pipefail

ENV_FILE="${1:-.env.prod}"
COMPOSE_BIN="${COMPOSE_BIN:-docker compose}"

echo ">>> Building containers"
$COMPOSE_BIN --env-file "${ENV_FILE}" build

echo ">>> Starting MySQL"
$COMPOSE_BIN --env-file "${ENV_FILE}" up -d mysql

echo ">>> Waiting for MySQL to accept connections..."
$COMPOSE_BIN --env-file "${ENV_FILE}" exec mysql sh -c "until mysqladmin ping -h localhost --silent; do sleep 1; done" >/dev/null

run_cmd() {
  local service="$1"
  shift
  echo ">>> Running on ${service}: $*"
  $COMPOSE_BIN --env-file "${ENV_FILE}" run --rm "${service}" sh -lc "$*"
}

run_cmd users-service "pnpm --filter @epem/users-service prisma:push"
run_cmd patients-service "pnpm --filter @epem/patients-service prisma:push"
run_cmd catalog-service "pnpm --filter @epem/catalog-service prisma:push"
run_cmd billing-service "pnpm --filter @epem/billing-service prisma:push"

run_cmd users-service "pnpm --filter @epem/users-service seed:admin"
run_cmd patients-service "pnpm --filter @epem/patients-service seed:patients"
run_cmd catalog-service "pnpm --filter @epem/catalog-service seed:items"
run_cmd billing-service "pnpm --filter @epem/billing-service seed:insurers"

echo ">>> Bootstrapping complete. Launch the full stack with:"
echo "    ${COMPOSE_BIN} --env-file ${ENV_FILE} up -d"
