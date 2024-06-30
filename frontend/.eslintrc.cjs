// eslint-disable-next-line no-undef
module.exports = {
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:@stylistic/recommended-extends',
  ],
  ignorePatterns: ['dist', '**/*.html', 'node_modules'],
  overrides: [{ files: ['**/*.js', '**/*.jsx'] }],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    '@stylistic',
    'react-hooks',
    'react-refresh',
  ],
  root: true,
  rules: {
    '@stylistic/arrow-parens': ['error', 'as-needed'],
    '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
    '@stylistic/jsx-curly-spacing': ['error', { when: 'never', children: { when: 'always' } }],
    'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    'react/react-in-jsx-scope': 'off',
  },
  settings: { react: { version: '18.2' } },
}
