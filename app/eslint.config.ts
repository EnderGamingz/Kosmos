import * as reactHooks from 'eslint-plugin-react-hooks';
import * as reactRefresh from 'eslint-plugin-react-refresh';

export default [
  {
    root: true,
    env: { browser: true, es2020: true },
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parser: '@typescript-eslint/parser',
    plugins: ['react-refresh'],
    rules: {
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  reactHooks.configs.recommended,
  reactRefresh.configs.recommended,
];
