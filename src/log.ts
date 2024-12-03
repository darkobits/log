import env from '@darkobits/env'
import maskString from '@darkobits/mask-string'
import chalk from 'chalk'
import {
  createConsola,
  LogLevels,
  type LogType
} from 'consola'
import merge from 'deepmerge'
import ora, { type Ora, type Options as OraOptions } from 'ora'

import { createChronograph, createScopeMatcher } from 'lib/utils'

import type { EnhancedConsolaOptions, EnhancedConsola } from 'etc/types'

/**
 * Creates and returns an `EnhancedConsola` instance.
 */
export function createLogger(options: Partial<EnhancedConsolaOptions> = {}): EnhancedConsola {
  const {
    heading,
    level,
    debugScope,
    debugExpression,
    chalkOptions,
    ...restOptions
  } = options

  /**
   * @private
   *
   * List of strings (TODO ADD REGEXP) or patterns that should be redacted from
   * subsequent log messages.
   */
  const maskedSecrets: Array<string> = []

  let scopeMatcher: ((testScope: string) => boolean) | undefined

  const enhancedConsola = Object.assign(createConsola({
    level: LogLevels.silent,
    ...restOptions
  }), {
    chalk: new chalk.Instance(chalkOptions),
    create: (childOptions: Partial<EnhancedConsolaOptions> = {}): EnhancedConsola => {
      const { heading: parentHeading, ...parentOptions } = options
      const mergedOptions = merge(parentOptions, childOptions)

      mergedOptions.heading = chalk => {
        const resolvedChildHeading = typeof childOptions.heading === 'function'
          ? childOptions.heading(chalk)
          : childOptions.heading
        return [parentHeading, resolvedChildHeading].join(' ')
      }

      if (options.debugScope || childOptions.debugScope) {
        mergedOptions.debugScope = options.debugScope && childOptions.debugScope
          ? [options.debugScope, childOptions.debugScope].filter(Boolean).join(':')
          : childOptions.debugScope ?? options.debugScope ?? ''
      }

      const childLogger = createLogger(mergedOptions)

      // Child loggers should inherit the masked secrets of their parents.
      maskedSecrets.forEach(secret => childLogger.maskSecret(secret))

      return childLogger
    },
    chronograph: createChronograph,
    maskSecret: (secret: string) => {
      if (typeof secret !== 'string' || secret.length === 0) return
      maskedSecrets.push(secret)
    },
    ora: (oraOptions: OraOptions): Ora => {
      // isSuspended = true
      // queue.pause()
      enhancedConsola.pauseLogs()

      const oraInstance = ora({ ...oraOptions /** , stream: enhancedConsola. */ })

      const decorateMethods = ['stop', 'succeed', 'fail', 'warn', 'info', 'stopAndPersist'] as const

      // Decorate Ora methods that stop spinners such that they also resume logs
      // after stopping the spinner.
      decorateMethods.forEach(methodName => {
        const originalMethod = oraInstance[methodName]

        Reflect.set(oraInstance, methodName, (...args: Parameters<typeof originalMethod>) => {
          const returnValue = Reflect.apply(originalMethod, oraInstance, args)
          enhancedConsola.resumeLogs()
          return returnValue
        })
      })

      oraInstance.start()

      return oraInstance
    }
  })

  // ----- Initialization ------------------------------------------------------

  // Start in a paused state until we resolve config.
  enhancedConsola.pauseLogs()

  // Asynchronously resolve `debugExpression` and create a scope matcher.
  const debugExpressionPromise = Promise.resolve(debugExpression ?? env('DEBUG'))
    .then(resolvedDebugExpression => {
      scopeMatcher = createScopeMatcher(resolvedDebugExpression)
    })

  // If we received an async value as our `level` option, wait for it to resolve
  // then set the logger to that level, if it is valid. Otherwise, set the level
  // to the value of the LOG_LEVEL environment variable, if valid. Otherwise,
  // set the level to 'info', the default for Consola. Then, flush all log
  // messages that may have accumulated while we were waiting.
  const logLevelPromise = Promise.resolve(level ?? env<LogType>('LOG_LEVEL'))
    .then(resolvedLevel => {
      enhancedConsola.level = resolvedLevel && LogLevels[resolvedLevel]
        ? LogLevels[resolvedLevel]
        : LogLevels.info
    })
    .catch(() => {
      enhancedConsola.level = LogLevels.info
    })

  // Wait for all init-related tasks to finish, then resume logging.
  const initPromise = Promise.all([
    debugExpressionPromise,
    logLevelPromise
  ]).then(() => {
    enhancedConsola.resumeLogs()
  })

  // ----- Decorate Log Methods ------------------------------------------------

  // Compute the prefix to prepend to log messages.
  const resolvedHeading = typeof heading === 'function'
    ? heading(enhancedConsola.chalk)
    : heading

  // Decorate log methods.
  void (Object.keys(LogLevels) as Array<LogType>).forEach(logLevel => {
    const originalMethod = Reflect.get(enhancedConsola, logLevel)
    if (typeof originalMethod !== 'function') return

    Reflect.set(enhancedConsola, logLevel, async (...args: Array<any>) => {
      await initPromise

      const maskedArgs = args.map(arg => (typeof arg === 'string'
        ? maskString(maskedSecrets, arg)
        : arg))

      // Determine whether we should log a given debug or trace message even if
      // the current log level would not permit it. This will happen if the
      // logger was configured with a debug scope and debug expression (which
      // will fall back to the DEBUG environment variable, if set) and the
      // configured scope matches the configured expression.
      const shouldLogAsDebugMessage = ['debug', 'trace'].includes(logLevel) &&
        scopeMatcher?.(debugScope ?? '')

      if (shouldLogAsDebugMessage) {
        const currentLevel = enhancedConsola.level
        enhancedConsola.level = LogLevels[logLevel]
        maskedArgs.unshift(enhancedConsola.chalk.cyan.bold(debugScope))
        Reflect.apply(originalMethod, enhancedConsola, maskedArgs)
        enhancedConsola.level = currentLevel
      } else {
        if (resolvedHeading) maskedArgs.unshift(resolvedHeading)
        Reflect.apply(originalMethod, enhancedConsola, maskedArgs)
      }
    })
  })

  return enhancedConsola
}

/**
 * Provided a set of default options, returns a version of `createLogger` that
 * will use those defaults.
 */
export function createLoggerFactory(defaultOptions: Partial<EnhancedConsolaOptions> = {}) {
  return (options: Partial<EnhancedConsolaOptions> = {}) => createLogger(merge(defaultOptions, options))
}