import env from '@darkobits/env'
import maskString from '@darkobits/mask-string'
import chalkModule from 'chalk'
import {
  createConsola,
  LogLevels,
  type LogType
} from 'consola'
import merge from 'deepmerge'
import ora, { type Ora, type Options as OraOptions } from 'ora'
import pWaitFor from 'p-wait-for'

import { IS_NODE } from 'etc/constants'
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
   * Whether the logger has finished async initialization.
   */
  let isInitialized = false

  /**
   * Chalk instance for this logger.
   */
  const chalk = new chalkModule.Instance(chalkOptions)

  /**
   * @private
   *
   * List of strings (TODO ADD REGEXP) or patterns that should be redacted from
   * subsequent log messages.
   */
  const maskedSecrets: Array<string | RegExp> = []

  /**
   * @private
   *
   * Function bound to the configured debug expression (or the DEBUG environment
   * variable) which can be used as a predicate to determine if
   */
  let scopeMatcher: ((testScope: string) => boolean) | undefined

  const enhancedConsola = Object.assign(createConsola({
    level: LogLevels.silent,
    ...restOptions
  }), {
    chalk: new chalk.Instance(chalkOptions),
    create: (childOptions: Partial<EnhancedConsolaOptions> = {}): EnhancedConsola => {
      const { heading: parentHeading, ...parentOptions } = options
      const mergedOptions = merge(parentOptions, childOptions)

      // Child loggers have their headings appended to the parent logger's
      // heading.
      mergedOptions.heading = (chalk, parentConfig) => {
        const resolvedParentHeading = typeof parentHeading === 'function'
          ? parentHeading(chalk, parentConfig)
          : parentHeading

        const resolvedChildHeading = typeof childOptions.heading === 'function'
          ? childOptions.heading(chalk, resolvedParentHeading)
          : childOptions.heading

        return resolvedChildHeading
      }

      const childLogger = createLogger(mergedOptions)

      // Child loggers should inherit the masked secrets of their parents.
      maskedSecrets.forEach(secret => childLogger.maskSecret(secret))

      return childLogger
    },
    chronograph: createChronograph,
    maskSecret: (secret: string | RegExp) => {
      // Ignore empty strings.
      if (typeof secret === 'string' && secret.length === 0) return
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
    },
    getConfiguration: () => {
      return Object.freeze(options)
    },
    isReady: () => isInitialized,
    onReady: () => pWaitFor<void>(() => isInitialized)
  })

  // ----- Initialization ------------------------------------------------------

  // Start in a paused state until we are finished initializing.
  enhancedConsola.pauseLogs()

  // Resolve `debugExpression` and create a scope matcher.
  const debugExpressionPromise = Promise.resolve(
    debugExpression ?? IS_NODE ? env('DEBUG') : undefined
  ).then(resolvedDebugExpression => {
    scopeMatcher = createScopeMatcher(resolvedDebugExpression)
  })

  // If we received an async value as our `level` option, wait for it to resolve
  // then set the logger to that level, if it is valid. Otherwise, set the level
  // to the value of the LOG_LEVEL environment variable, if valid. Otherwise,
  // set the level to 'info', the default for Consola. Then, flush all log
  // messages that may have accumulated while we were waiting.
  const logLevelPromise = Promise.resolve(
    level ?? env<LogType>('LOG_LEVEL')
  ).then(resolvedLevel => {
    enhancedConsola.level = resolvedLevel && LogLevels[resolvedLevel]
      ? LogLevels[resolvedLevel]
      : LogLevels.info
  }).catch(() => {
    enhancedConsola.level = LogLevels.info
  })

  // Wait for all init-related tasks to finish, then resume logging.
  const initPromise = Promise.all([
    debugExpressionPromise,
    logLevelPromise
  ]).then(() => {
    enhancedConsola.resumeLogs()
    isInitialized = true
  })

  // ----- Decorate Log Methods ------------------------------------------------

  // Compute the prefix to prepend to log messages.
  const resolvedHeading = typeof heading === 'function'
    ? heading(enhancedConsola.chalk)
    : heading

  const formattedDebugScope = enhancedConsola.chalk.cyan(debugScope)

  void (Object.keys(LogLevels) as Array<LogType>).forEach(logLevelMethodName => {
    const originalMethod = Reflect.get(enhancedConsola, logLevelMethodName)
    if (typeof originalMethod !== 'function') return

    const isDebugOrTrace = ['debug', 'trace'].includes(logLevelMethodName)

    // Decorate log method.
    Reflect.set(enhancedConsola, logLevelMethodName, (...args: Array<any>) => {
      const doLogMessageSync = () => {
        // Redact any masked secrets from provided string arguments.
        const maskedArgs = args.map(arg => (
          typeof arg === 'string' ? maskString(maskedSecrets, arg) : arg)
        )

        let finalArgs = maskedArgs
        const currentLevel = enhancedConsola.level

        // Determine whether we should log a given debug or trace message even
        // if the current log level would not permit it. This will happen if the
        // logger was configured with a debug scope and debug expression (which
        // will fall back to the DEBUG environment variable, if set) and the
        // configured scope matches the configured expression.
        const shouldLogAsDebugMessage = isDebugOrTrace &&
          scopeMatcher &&
          debugScope &&
          scopeMatcher(debugScope)

        if (shouldLogAsDebugMessage) {
          // Temporarily set the log level to the level of the incoming message.
          enhancedConsola.level = LogLevels[logLevelMethodName]

          // If we have a heading, prepend the heading and debug scope.
          // Otherwise, prepend the debug scope only.
          finalArgs = resolvedHeading
            ? [resolvedHeading, formattedDebugScope, ...finalArgs]
            : [formattedDebugScope, ...finalArgs]
        } else {
          // If we have a heading, prepend it.
          if (resolvedHeading) finalArgs = [resolvedHeading, ...finalArgs]
        }

        // Invoke the original Consola method with our final arguments.
        Reflect.apply(originalMethod, enhancedConsola, finalArgs)

        // Restore log log level. If we didn't temporarily set it, this will be
        // a no-op.
        enhancedConsola.level = currentLevel
      }

      // Only use async if we are not initialized. This ensures more predictable
      // behavior around ordering of log messages once the logger is ready.
      return isInitialized ? doLogMessageSync() : initPromise.then(doLogMessageSync)
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