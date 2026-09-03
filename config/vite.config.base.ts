import { resolve } from 'path';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import svgLoader from 'vite-svg-loader';
import { ArcoResolver } from 'unplugin-vue-components/resolvers';
import configArcoResolverPlugin from './plugin/arcoResolver';
import AutoImport from 'unplugin-auto-import/vite';

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    svgLoader({ svgoConfig: {} }),
    // 按需自动导入 Message 等 API；样式由 Components sideEffect 与 main.ts 命令式样式兜底
    AutoImport({
      resolvers: [ArcoResolver()],
    }),
    configArcoResolverPlugin(),
  ],
  resolve: {
    alias: [
      {
        find: '@',
        replacement: resolve(__dirname, '../src'),
      },
      {
        find: 'assets',
        replacement: resolve(__dirname, '../src/assets'),
      },
      {
        find: 'dayjs',
        replacement: 'dayjs/esm',
      },
      {
        find: 'vue-i18n',
        replacement: 'vue-i18n/dist/vue-i18n.cjs.js', // Resolve the i18n warning issue
      },
      {
        find: 'vue',
        replacement: 'vue/dist/vue.esm-bundler.js', // compile template
      },
    ],
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
  },
  css: {
    preprocessorOptions: {
      less: {
        modifyVars: {
          hack: `true; @import (reference) "${resolve('src/assets/style/breakpoint.less')}";`,
          // 'arcoblue-6': '#00ADB5',
        },
        javascriptEnabled: true,
      },
    },
  },
});
