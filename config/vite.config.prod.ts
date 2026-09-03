import { mergeConfig } from 'vite';
import baseConfig from './vite.config.base';
import configCompressPlugin from './plugin/compress';
import configVisualizerPlugin from './plugin/visualizer';

const images = ['png', 'jpeg', 'svg'];
export default mergeConfig(
  {
    mode: 'production',
    base: '/',
    plugins: [configCompressPlugin('gzip'), configVisualizerPlugin()],
    build: {
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
              if (id.includes('md-editor-v3')) return 'md-editor';
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
