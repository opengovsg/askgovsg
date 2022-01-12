module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '~shared/(.*)': '<rootDir>/../shared/build/$1',
    'jose/dist/types/(.*)': '<rootDir>/node_modules/jose/dist/node/cjs/$1',
  },
}
