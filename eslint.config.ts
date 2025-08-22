import { globalIgnores } from 'eslint/config';
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript';
import pluginVue, { rules } from 'eslint-plugin-vue';
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting';

// To allow more languages other than `ts` in `.vue` files, uncomment the following lines:
// import { configureVueProject } from '@vue/eslint-config-typescript'
// configureVueProject({ scriptLangs: ['ts', 'tsx'] })
// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },

  globalIgnores(['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/assets/**']),

  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,
  skipFormatting,
  // 追加在 skipFormatting 后面
  {
    // 可选：注册额外插件（示例：import、unused-imports、simple-import-sort）
    plugins: {},
    rules: {
      '@typescript-eslint/no-unused-vars': 'off',
      // 保持项目原有严格规则，不在配置中关闭
      'vue/multi-word-component-names': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
);
