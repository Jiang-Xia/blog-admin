#!/bin/bash
# =============================================================================
# blog-admin 远程回滚脚本（静态前端）
# =============================================================================

set -euo pipefail

: "${DEPLOY_REMOTE_DIR:?}"

BACKUP_DIR="${DEPLOY_REMOTE_DIR}/releases/backups"
BACKUP_ARG="${1:-}"
BACKUP_NAME_PATTERN='^backup-[0-9]{8}-[0-9]{6}\.tar\.gz$'

assert_backup_basename() {
  local name="$1"
  if [[ ! "$name" =~ $BACKUP_NAME_PATTERN ]]; then
    echo "Invalid backup name (expected backup-YYYYMMDD-HHMMSS.tar.gz): ${name}" >&2
    return 1
  fi
}

assert_backup_in_dir() {
  local file="$1"
  local dir_real file_real
  dir_real="$(realpath "$BACKUP_DIR")"
  file_real="$(realpath "$file")"
  if [[ "$file_real" != "$dir_real"/* ]]; then
    echo "Backup path escapes backup dir: ${file}" >&2
    return 1
  fi
}

resolve_backup_file() {
  if [[ -n "$BACKUP_ARG" ]]; then
    local base="${BACKUP_ARG##*/}"
    assert_backup_basename "$base" || return 1
    local candidate="${BACKUP_DIR}/${base}"
    if [[ -f "$candidate" ]]; then
      echo "$candidate"
      return 0
    fi
    echo "Backup not found: ${base}" >&2
    return 1
  fi
  ls -1t "${BACKUP_DIR}"/backup-*.tar.gz 2>/dev/null | head -1
}

if [[ "${DEPLOY_ROLLBACK_LIST:-}" == "1" ]]; then
  echo "Available backups in ${BACKUP_DIR}:"
  ls -1t "${BACKUP_DIR}"/backup-*.tar.gz 2>/dev/null || echo "(none)"
  exit 0
fi

BACKUP_FILE="$(resolve_backup_file)"
if [[ -z "$BACKUP_FILE" || ! -f "$BACKUP_FILE" ]]; then
  echo "No backup found in ${BACKUP_DIR}" >&2
  exit 1
fi
assert_backup_in_dir "$BACKUP_FILE"

echo "==> rollback from: ${BACKUP_FILE}"

echo "==> clean: ${DEPLOY_REMOTE_DIR}"
mkdir -p "${DEPLOY_REMOTE_DIR}"
find "${DEPLOY_REMOTE_DIR}" -mindepth 1 -maxdepth 1 ! -name releases -exec rm -rf {} +

echo "==> extract backup -> ${DEPLOY_REMOTE_DIR}"
tar -xzf "${BACKUP_FILE}" -C "${DEPLOY_REMOTE_DIR}"

echo "==> rollback done"
test -f "${DEPLOY_REMOTE_DIR}/index.html" && echo "index.html OK"
