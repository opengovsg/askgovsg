module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '~shared/(.*)': '<rootDir>/../shared/build/$1',
  },
  testPathIgnorePatterns: [
    '<rootDir>/src/modules/search/__tests__/opensearch-mock',
  ],
}
