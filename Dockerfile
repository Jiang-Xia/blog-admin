# blog-admin H5 静态镜像（本地 Docker 试验；生产仍用 npm run deploy）
# API 指向 localhost:8000（浏览器访问，非容器内网）

FROM node:22-alpine AS builder
WORKDIR /app
# 国内构建加速（可按需改回官方源）
ENV npm_config_registry=https://registry.npmmirror.com

COPY package.json package-lock.json ./
# husky prepare 在镜像内无需执行
RUN npm ci --ignore-scripts

COPY . .
# vite.config.prod 固定 mode=production，用 .env.docker 覆盖生产 env 再构建
RUN cp .env.docker .env.production \
  && npx vite build --config ./config/vite.config.prod.ts

FROM nginx:1.27-alpine
COPY deploy/docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
