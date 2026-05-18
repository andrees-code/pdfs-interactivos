// eslint.config.mjs
import eslintPluginVue from 'eslint-plugin-vue'
import tseslint from '@typescript-eslint/parser'
import vueEslintConfigPrettier from '@vue/eslint-config-prettier'
import typescriptEslint from '@vue/eslint-config-typescript'

export default [
  ...eslintPluginVue.configs['flat/recommended'],
  ...typescriptEslint,
  vueEslintConfigPrettier,
  {
    files: ['**/*.vue', '**/*.js', '**/*.ts'],
    languageOptions: {
      parser: tseslint,
      parserOptions: {
        project: './tsconfig.json',
        extraFileExtensions: ['.vue'],
      },
    },
  },
]
