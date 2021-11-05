module.exports = {
  extends: ['plugin:prettier/recommended'],
  rules: {
    'no-console': 'warn',
    'no-undef': 'error',
  },
  overrides: [
    {
      files: ['src/**/*.jsx?'],
      extends: ['plugin:react/recommended', 'plugin:prettier/recommended'],
    },
    {
      files: ['src/**/*.ts', 'src/**/*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      extends: [
        'plugin:@typescript-eslint/recommended',
        'plugin:prettier/recommended',
      ],
    },
  ],
  ignorePatterns: ['node_modules/**/*', 'build/**/*'],
  env: {
    browser: true,
    node: true,
    es6: true,
  },
}
