import ora, { type Options as OraOptions } from 'ora'

import { IS_NODE } from 'etc/constants'

type Ora = ReturnType<typeof ora>

interface CreateSpinnerOptions extends OraOptions {
  /**
   * Optional callback that will be invoked when the spinner is stopped.
   */
  onStop?: (...args: Array<any>) => void
}

/**
 * List of Ora instance methods that stop the spinner.
 */
const stopMethods = ['stop', 'succeed', 'fail', 'warn', 'info', 'stopAndPersist'] as const

// Browser-compatible mock spinner implementation
const createMockSpinner = (options: CreateSpinnerOptions): Ora => ({
  start: () => ({}),
  stop: () => ({}),
  succeed: () => ({}),
  fail: () => ({}),
  warn: () => ({}),
  info: () => ({}),
  stopAndPersist: () => ({}),
  isSpinning: false,
  text: ''
} as Ora)

/**
 * Creates and starts a new Ora spinner using the provided options.
 * In Node environments, this returns a real Ora instance.
 * In browser environments, this returns a mock implementation.
 */
export function createSpinner(options: CreateSpinnerOptions): Ora {
  const { onStop, ...oraOptions } = options

  // In browser environments, return the mock implementation
  if (!IS_NODE) {
    return createMockSpinner(options)
  }

  // In Node environments, create and return a real Ora instance
  const spinner = ora(oraOptions)

  // Decorate Ora methods that stop spinners such that they also resume logs
  // after stopping the spinner.
  stopMethods.forEach(methodName => {
    const originalMethod = spinner[methodName]
    Reflect.set(spinner, methodName, (...args: Parameters<typeof originalMethod>) => {
      const returnValue = Reflect.apply(originalMethod, spinner, args)
      if (onStop) onStop(...args)
      return returnValue
    })
  })

  spinner.start()

  return spinner
}