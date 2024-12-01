import { defineFlatConfig, ts } from '@darkobits/eslint-plugin'

export default defineFlatConfig([
  { ignores: ['fixtures/**'] },
  ...ts,
  { rules: {
    'max-len': ['warn', 120],
    'no-console': 'off',
    'unicorn/no-null': 'off',
    'unicorn/no-reduce': 'off',
    // This rule does not seem to understand what a type import is.
    'unicorn/import-style': 'off'
  }}
])