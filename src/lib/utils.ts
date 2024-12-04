/**
 * Predicate that always returns false.
 */
export const noOpPredicate = () => false

/**
 * Provided a valid DEBUG environment variable, returns a predicate that accepts
 * a debug scope and returns `true` if that scope's log messages should be
 * allowed according to the expression.
 *
 * If an empty string or any non-string value is provided as an expression, the
 * resulting predicate will always return `true`.
 *
 * See: https://www.npmjs.com/package/debug
 */
export function createScopeMatcher(debugExpression?: any) {
  if (typeof debugExpression !== 'string' || debugExpression === '') return noOpPredicate

  const rawStatements = debugExpression.split(/,\s*/g)
  const rawSegments = rawStatements.flatMap(s => s.split(':'))
  if (rawSegments.includes('')) return noOpPredicate

  const statements = rawStatements.map(s => s.replace('*', String.raw`[^\s]+`))
  const allowPatterns = statements.filter(s => !s.startsWith('-')).map(s => new RegExp(`^${s}$`))
  const denyPatterns = statements.filter(s => s.startsWith('-')).map(s => new RegExp(`^${s.replaceAll(/^-/g, '')}$`))

  const isAllowed = (input: string) => allowPatterns.some(p => input.match(p))
  const isDenied = (input: string) => denyPatterns.some(p => input.match(p))

  return (testScope: string) => isAllowed(testScope) && !isDenied(testScope)
}