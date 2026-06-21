#!/bin/bash
# Linux/macOS: build -> tar dist -> upload -> extract
# Usage: bash deploy/pm2/deploy.sh

set -euo pipefail

ENV_FILE_NAME="${1:-deploy.local.env}"
ROOT="$(cd "$(dirname "$0")/../../" && pwd)"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ENV_FILE="${SCRIPT_DIR}/${ENV_FILE_NAME}"
PACK_DIR="${SCRIPT_DIR}/.pack"
REMOTE_SCRIPT="${SCRIPT_DIR}/remote-deploy.sh"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing $ENV_FILE"
  exit 1
fi

# shellcheck disable=SC1090
source "$ENV_FILE"

: "${DEPLOY_HOST:?}"
: "${DEPLOY_USER:?}"
: "${DEPLOY_PASSWORD:?}"
: "${DEPLOY_REMOTE_DIR:?}"

DEPLOY_PORT="${DEPLOY_PORT:-22}"
DEPLOY_TAR_NAME="${DEPLOY_TAR_NAME:-blog-admin.tar.gz}"
REMOTE_TAR="/tmp/${DEPLOY_TAR_NAME}"
TAR_LOCAL="${PACK_DIR}/${DEPLOY_TAR_NAME}"

if [[ ! -f "$ROOT/.env.production" ]]; then
  echo "Missing $ROOT/.env.production"
  exit 1
fi

SSH_OPTS=(-p "$DEPLOY_PORT" -o StrictHostKeyChecking=no)
REMOTE="${DEPLOY_USER}@${DEPLOY_HOST}"

run_ssh() {
  if command -v sshpass >/dev/null 2>&1; then
    sshpass -p "$DEPLOY_PASSWORD" ssh "${SSH_OPTS[@]}" "$REMOTE" "$@"
  else
    ssh "${SSH_OPTS[@]}" "$REMOTE" "$@"
  fi
}

run_scp() {
  if command -v sshpass >/dev/null 2>&1; then
    sshpass -p "$DEPLOY_PASSWORD" scp -P "$DEPLOY_PORT" -o StrictHostKeyChecking=no "$1" "${REMOTE}:$2"
  else
    scp -P "$DEPLOY_PORT" -o StrictHostKeyChecking=no "$1" "${REMOTE}:$2"
  fi
}

echo "==> [1/4] Build (.env.production)"
cd "$ROOT"
npm ci --ignore-scripts
npm run build

echo "==> [2/4] Pack tar"
mkdir -p "$PACK_DIR"
rm -f "$TAR_LOCAL"
tar -czf "$TAR_LOCAL" -C "$ROOT/dist" .

echo "==> [3/4] Upload"
run_scp "$TAR_LOCAL" "$REMOTE_TAR"
run_scp "$REMOTE_SCRIPT" "/tmp/remote-deploy.sh"

echo "==> [4/4] Remote extract"
run_ssh "chmod +x /tmp/remote-deploy.sh && DEPLOY_REMOTE_DIR='${DEPLOY_REMOTE_DIR}' DEPLOY_TAR_PATH='${REMOTE_TAR}' bash /tmp/remote-deploy.sh"

echo "==> Done"
