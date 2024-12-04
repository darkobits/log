import ms from 'ms'

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

/**
 * Creates an object that can be used as a chronograph. After being started, it
 * can be placed directly into interpolated strings to print its current value.
 */
export function createChronograph() {
  const createdAt = Date.now()

  let state: 'running' | 'paused' = 'running'
  let segmentStartTime = createdAt
  let msAccumulated = 0

  return {
    /** When the chronograph was created as a UNIX timestamp. */
    get createdAt() {
      return createdAt
    },
    /** Whether the chronograph is currently paused or running. */
    get state() {
      return state
    },
    /** Number of milliseconds accumulated by the chronograph. */
    get value() {
      return state === 'paused' ? msAccumulated : Date.now() - segmentStartTime + msAccumulated
    },
    /** Number of milliseconds accumulated by the chronograph. */
    toNumber: () => {
      return state === 'paused' ? msAccumulated : Date.now() - segmentStartTime + msAccumulated
    },
    /** String representation of the chronograph's value. @example '20s' */
    toString: () => {
      return ms(state === 'paused' ? msAccumulated : Date.now() - segmentStartTime + msAccumulated)
    },
    /** String representation of the chronograph's value. @example '20s' */
    toJSON: () => {
      return ms(state === 'paused' ? msAccumulated : Date.now() - segmentStartTime + msAccumulated)
    },
    /** Pauses the chronograph. */
    pause: () => {
      if (state === 'paused') return
      msAccumulated += Date.now() - segmentStartTime
      state = 'paused'
    },
    /** Resumes the chronograph. */
    resume: () => {
      if (state === 'running') return
      segmentStartTime = Date.now()
      state = 'running'
    },
    /** Resets the chronograph's accumulated time to 0. */
    reset: () => {
      msAccumulated = 0
    }
  }
}