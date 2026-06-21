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

可选：`DEPLOY_BACKUP_KEEP=5`（默认保留最近 5 份备份）

## 流程

1. 读根目录 `.env.production` → `npm run build`
2. **备份**当前静态文件 → 打包 `dist/` → tar → 上传
3. 服务器清空静态目录并解压

无 PM2，env 不打进 tar（已编译进 JS）。

备份目录：`{DEPLOY_REMOTE_DIR}/releases/backups/`

## 回滚

```powershell
npm run rollback:list
npm run rollback
npm run rollback -- -BackupName backup-20250621-143022.tar.gz
```

FinalShell：`/opt/jxapp/front/blog-admin/releases/backups/`
