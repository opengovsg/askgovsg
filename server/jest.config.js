module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '~shared/(.*)': '<rootDir>/../shared/build/$1',
  },
}
