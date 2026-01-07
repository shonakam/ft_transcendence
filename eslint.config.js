import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';

import eslintConfigPrettier from 'eslint-config-prettier/flat';

const ignores = ['**/dist/**', '**/node_modules/**'];

export default [
  { ignores },

  // JS recommended（object）
  js.configs.recommended,

  // TS recommended（array）
  ...tseslint.configs.recommended,

  {
    files: ['**/*.{js,ts}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      import: importPlugin,
    },
  },

  {
    files: ['containers/application/backend/**/*.ts'],
    languageOptions: {
      globals: {
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
    },
  },

  {
    files: ['containers/application/frontend/**/*.ts'],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
      },
    },
  },

  // Prettier（array）
  eslintConfigPrettier,
];
