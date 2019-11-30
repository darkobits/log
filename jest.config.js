module.exports = require('@darkobits/ts-unified/dist/config/jest')({
  coveragePathIgnorePatterns: [
    '<rootDir>/src/etc',
    '<rootDir>/src/testing.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 75,
      functions: 80,
      lines: 90
    }
  }
});
