import { mergeConfig } from 'vite';
import baseConfig from './vite.config.base';
import configCompressPlugin from './plugin/compress';
import configVisualizerPlugin from './plugin/visualizer';
// import configImageminPlugin from './plugin/imagemin';

const images = ['png', 'jpeg', 'svg'];
export default mergeConfig(
  {
    mode: 'production',
    base: './',
    plugins: [
      configCompressPlugin('gzip'),
      configVisualizerPlugin(),
      // configImageminPlugin(),
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            arco: ['@arco-design/web-vue'],
            chart: ['echarts', 'vue-echarts'],
            vue: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n'],
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
