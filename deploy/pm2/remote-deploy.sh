#!/bin/bash
# 静态前端：清空目标目录 -> 解压 dist
# 环境变量: DEPLOY_REMOTE_DIR, DEPLOY_TAR_PATH

set -euo pipefail

: "${DEPLOY_REMOTE_DIR:?}"
: "${DEPLOY_TAR_PATH:?}"

echo "==> clean: ${DEPLOY_REMOTE_DIR}"
mkdir -p "${DEPLOY_REMOTE_DIR}"
find "${DEPLOY_REMOTE_DIR}" -mindepth 1 -maxdepth 1 -exec rm -rf {} +

echo "==> extract: ${DEPLOY_TAR_PATH} -> ${DEPLOY_REMOTE_DIR}"
tar -xzf "${DEPLOY_TAR_PATH}" -C "${DEPLOY_REMOTE_DIR}"

rm -f "${DEPLOY_TAR_PATH}"

echo "==> done"
ls -la "${DEPLOY_REMOTE_DIR}" | head -10
