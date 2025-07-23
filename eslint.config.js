// eslint.config.js
import vue from 'eslint-plugin-vue'
import prettier from 'eslint-config-prettier'

export default [
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: require.resolve('vue-eslint-parser'),
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      vue,
    },
    rules: {
      ...vue.configs['vue3-recommended'].rules,
      'vue/no-multiple-template-root': 'off',
    },
  },
  prettier,
]
