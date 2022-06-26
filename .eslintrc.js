// "off" 或者 0：关闭规则。
// "warn" 或者 1：打开规则，并且作为一个警告（不影响exit code）。
// "error" 或者 2：打开规则，并且作为一个错误（exit code将会是1）。

module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },

  plugins: ['prettier'],
  extends: [
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
    'eslint:recommended'
  ],
  // The Follow configs works with eslint-plugin-vue v7.x.x
  globals: {
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  },
  // add your custom rules here
  // it is base on https://github.com/vuejs/eslint-config-vue
  rules: {
    'prettier/prettier': 'error',
    'vue/multi-word-component-names': [
      0,
      {
        ignores: []
      }
    ],
    'no-unused-vars': 0,
    '@typescript-eslint/no-unused-vars': [0],
    '@typescript-eslint/no-explicit-any': [0] // any类型
  }
}
