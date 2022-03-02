module.exports = {
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    'no-console': 'warn',
    'no-undef': 'error',
  },
  parser: '@typescript-eslint/parser',
  ignorePatterns: ['node_modules/**/*', 'build/**/*', 'config-overrides.js'],
  globals: {
    JSX: true,
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
}
