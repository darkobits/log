module.exports = {
  extends: require('@darkobits/ts').eslint,
  rules: {
    'unicorn/no-reduce': 'off',
    // This rule does not seem to understand what a type import is.
    'unicorn/import-style': 'off'
  }
};
