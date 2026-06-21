# blog-admin 一键部署

## 命令

```powershell
npm run deploy
```

静态目录：`/opt/jxapp/front/blog-admin` → `https://admin.jiang-xia.top`

## 配置

| 文件 | 说明 |
|------|------|
| `.env.production`（根目录） | Vite 生产 build，**直接读这个** |
| `deploy/pm2/deploy.local.env` | SSH（gitignore） |

可选：`DEPLOY_BACKUP_KEEP=5`、`DEPLOY_RELEASE_KEEP=5`

## 目录结构（方案 B，零停机）

```text
/opt/jxapp/front/blog-admin/
  current -> releases/20260622-143000/   # Nginx root 应指向 current
  releases/
    20260622-143000/                     # index.html、assets/…
    backups/
```

**Nginx** 需将 `root` / `alias` 改为 `.../blog-admin/current`（若仍指向旧扁平目录，首次部署后会自动迁移并创建 `current`）。

## 流程

1. 读根目录 `.env.production` → `npm run build`
2. 备份当前 active release → 打包 `dist/` → tar → 上传
3. 解压到新 `releases/时间戳/` → 切换 `current` 软链（旧版继续服务至切换瞬间）

无 PM2，env 不打进 tar（已编译进 JS）。

## 回滚

```powershell
npm run rollback:list
npm run rollback
npm run rollback -- -BackupName backup-20250621-143022.tar.gz
```

FinalShell：`/opt/jxapp/front/blog-admin/releases/`
