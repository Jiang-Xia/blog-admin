/**
 * Arco Design 组件 / Icon 按需自动注册，并注入对应 css sideEffect。
 * https://github.com/antfu/unplugin-vue-components
 * https://arco.design/vue/docs/start
 */
import Components from 'unplugin-vue-components/vite';
import { ArcoResolver } from 'unplugin-vue-components/resolvers';

export default function configArcoResolverPlugin() {
  return Components({
    dirs: [], // Avoid parsing src/components.  避免解析到 src/components
    deep: false,
    resolvers: [
      ArcoResolver({
        sideEffect: true,
        resolveIcons: true,
        importStyle: 'css',
      }),
    ],
  });
}
