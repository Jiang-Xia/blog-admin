import { mergeConfig, defineConfig, loadEnv } from 'vite';
import eslint from 'vite-plugin-eslint';
import baseConfig from './vite.config.base';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // 合并返回新配置
  return mergeConfig(
    {
      mode: 'development',
      server: {
        open: true,
        fs: {
          strict: true,
        },
        port: 9856,
        // 设置代理就没有浏览器不携带cookie问题了
        proxy: {
          '/blog-api': {
            target: env.VITE_API_BASE_URL,
            changeOrigin: true,
            rewrite: (path: string) => path.replace(/^\/blog-api/, ''),
          },
        },
      },
      plugins: [
        eslint({
          cache: false,
          include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.vue'],
          exclude: ['node_modules'],
        }),
      ],
    },
    baseConfig
  );
});
