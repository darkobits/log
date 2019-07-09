module.exports = require('@darkobits/ts-unified/dist/config/jest')({
  coverageThreshold: {
    global: {
      statements: 95,
      branches: 85,
      functions: 95,
      lines: 95
    }
  }
});
