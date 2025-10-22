#!/usr/bin/env sh
# Crea un token de aprobación de un solo uso para permitir el próximo git push.
set -e
ROOT=$(git rev-parse --show-toplevel)
echo $(date -u +%Y-%m-%dT%H:%M:%SZ) > "$ROOT/.allow-push"
echo "Aprobación creada en $ROOT/.allow-push. El próximo 'git push' será permitido y consumirá este permiso."

