import { mergeConfig, defineConfig, loadEnv } from 'vite';
import baseConfig from './vite.config.base';
import configCompressPlugin from './plugin/compress';
import configVisualizerPlugin from './plugin/visualizer';
import configObfuscatorPlugin from './plugin/obfuscator';

const images = ['png', 'jpeg', 'svg'];

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  // 构建期开关：仅 production build 生效；dev 不读此配置文件
  const enableObfuscate = env.VITE_ENABLE_OBFUSCATE === 'true';

  const plugins = [configCompressPlugin('gzip'), configVisualizerPlugin()];
  if (enableObfuscate) {
    plugins.push(configObfuscatorPlugin());
  }

  return mergeConfig(
    {
      mode: 'production',
      base: '/',
      plugins,
      build: {
        // 混淆场景下勿产出 sourcemap，避免映射回源码
        sourcemap: false,
        // 与混淆一并：构建期剥离 console / debugger（插件另有 disableConsoleOutput / debugProtection）
        esbuild: enableObfuscate
          ? {
              drop: ['console', 'debugger'],
            }
          : undefined,
        rollupOptions: {
          output: {
            // 按需引入后模块路径为 es/*，用 id 匹配才能把实际打进包的 Arco 码收进同一 vendor
            manualChunks(id) {
              if (id.includes('node_modules')) {
                if (id.includes('@arco-design')) return 'arco';
                if (
                  id.includes('echarts') ||
                  id.includes('vue-echarts') ||
                  id.includes('echarts-wordcloud')
                ) {
                  return 'chart';
                }
                if (
                  id.includes('vue-router') ||
                  id.includes('/pinia/') ||
                  id.includes('\\pinia\\') ||
                  id.includes('@vueuse/core') ||
                  id.includes('vue-i18n') ||
                  /[/\\]vue[/\\]/.test(id)
                ) {
                  return 'vue';
                }
                // md-editor 不单独 manualChunks：否则共享导出易被 entry/layout 静态依赖，登录页仍会 preload
                if (id.includes('xlsx')) return 'xlsx';
              }
              return undefined;
            },
            // 1.用于自定义构建结果中的静态资源名称
            // 2.定义各类型文件的目录分类
            assetFileNames: (assetInfo) => {
              // 根据文件类型决定输出目录
              if (assetInfo.name.endsWith('.css')) {
                return 'assets/css/[name]-[hash][extname]';
              }
              if (images.some((ext) => assetInfo.name.endsWith(ext))) {
                return 'assets/images/[name]-[hash][extname]';
              }
              return 'assets/[name]-[hash][extname]';
            },
            // 用于对代码分割中产生的 chunk 自定义命名
            chunkFileNames: (chunkInfo) => {
              // 根据chunk类型决定输出目录
              if (chunkInfo.isEntry) {
                // console.log(chunkInfo)
                return '[name].js';
              }
              return 'chunks/[name]-[hash].js';
            },
            // 用于指定 chunks 的入口文件模式
            entryFileNames: (chunkInfo) => {
              // console.log(chunkInfo.isEntry)
              // 所有入口文件输出到'entrys'目录
              return 'entrys/[name]-[hash].js';
            },
          },
        },
        chunkSizeWarningLimit: 2000,
      },
    },
    baseConfig,
  );
});
