#!/bin/bash
# =============================================================================
# blog-admin 远程部署脚本（静态前端，无 PM2）
# 由本地 deploy.ps1 通过 SSH 调用
#
# 流程：备份当前 dist → 清空静态目录 → 解压新 tar → 删除临时 tar
# Nginx 直接读 DEPLOY_REMOTE_DIR，如 /opt/jxapp/front/blog-admin
# =============================================================================

set -euo pipefail

: "${DEPLOY_REMOTE_DIR:?}"
: "${DEPLOY_TAR_PATH:?}"

BACKUP_DIR="${DEPLOY_REMOTE_DIR}/releases/backups"
BACKUP_KEEP="${DEPLOY_BACKUP_KEEP:-5}"

# -----------------------------------------------------------------------------
# 备份：打包目录下除 releases/ 外的所有顶层项（即当前静态站点）
# -----------------------------------------------------------------------------
backup_before_deploy() {
  if [[ ! -f "${DEPLOY_REMOTE_DIR}/index.html" ]]; then
    echo "==> skip backup (no existing release)"
    return 0
  fi

  local items=()
  local name
  for name in "${DEPLOY_REMOTE_DIR}"/*; do
    # releases/ 存历史备份，不能打进备份包也不能被清空
    [[ "$(basename "$name")" == "releases" ]] && continue
    items+=("$(basename "$name")")
  done

  if ((${#items[@]} == 0)); then
    echo "==> skip backup (empty release dir)"
    return 0
  fi

  mkdir -p "$BACKUP_DIR"
  local ts backup_file
  ts=$(date +%Y%m%d-%H%M%S)
  backup_file="${BACKUP_DIR}/backup-${ts}.tar.gz"
  echo "==> backup: ${backup_file}"
  tar -czf "$backup_file" -C "${DEPLOY_REMOTE_DIR}" "${items[@]}"

  ls -1t "$BACKUP_DIR"/backup-*.tar.gz 2>/dev/null | tail -n +$((BACKUP_KEEP + 1)) | while IFS= read -r f; do
    [[ -n "$f" ]] && rm -f "$f"
  done
  echo "==> backup kept: latest ${BACKUP_KEEP}"
}

backup_before_deploy

# 步骤 2：清空静态目录（保留 releases/ 备份目录）
echo "==> clean: ${DEPLOY_REMOTE_DIR}"
mkdir -p "${DEPLOY_REMOTE_DIR}"
find "${DEPLOY_REMOTE_DIR}" -mindepth 1 -maxdepth 1 ! -name releases -exec rm -rf {} +

# 步骤 3：解压 tar 内容到静态根（tar 内为 dist 根下的 index.html、assets/ 等）
echo "==> extract: ${DEPLOY_TAR_PATH} -> ${DEPLOY_REMOTE_DIR}"
tar -xzf "${DEPLOY_TAR_PATH}" -C "${DEPLOY_REMOTE_DIR}"

rm -f "${DEPLOY_TAR_PATH}"

echo "==> done"
ls -la "${DEPLOY_REMOTE_DIR}" | head -10
