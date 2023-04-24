import { mergeConfig, defineConfig, loadEnv } from 'vite';
import eslint from 'vite-plugin-eslint';
import baseConfig from './vite.config.base';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const prefixPath = env.VITE_PREFIX_PATH;
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
          [prefixPath]: {
            target: env.VITE_API_BASE_URL,
            changeOrigin: true,
            rewrite: (path: string) =>
              path.replace(new RegExp(`^${prefixPath}`), ''),
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
