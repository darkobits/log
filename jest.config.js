module.exports = require('@darkobits/ts').jest({
  coveragePathIgnorePatterns: [
    '<rootDir>/src/etc',
    '<rootDir>/src/testing.ts'
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 74,
      functions: 80,
      lines: 89
    }
  }
});
