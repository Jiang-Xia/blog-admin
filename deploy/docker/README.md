# blog-admin Docker（本地试验）

与 Go 单体一起在 WSL 试验时，由 `blog-server-go/deploy/docker/docker-compose.monolith.yml` 构建本目录镜像。

单独构建：

```bash
docker build -t blog-admin:local .
docker run --rm -p 9856:80 blog-admin:local
```

- 构建 env：`.env.docker`（构建时复制为 `.env.production`，API → `http://localhost:8000`）
- 访问：http://localhost:9856/
- 生产部署仍用 [`../pm2/README.md`](../pm2/README.md) 的 `npm run deploy`
