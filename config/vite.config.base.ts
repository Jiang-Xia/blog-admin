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
    AutoImport({
      resolvers: [ArcoResolver()],
    }),
    configArcoResolverPlugin(),

    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
    //   manifest: {
    //     icons: [
    //       {
    //         src: 'logo.png',
    //         sizes: '192x192',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'logo.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //       },
    //       {
    //         src: 'logo.png',
    //         sizes: '512x512',
    //         type: 'image/png',
    //         purpose: 'any maskable',
    //       },
    //     ],
    //   },
    // }),
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
  define: {
    'process.env': {},
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
