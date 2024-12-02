import env from '@darkobits/env'
import maskString from '@darkobits/mask-string'
import sleep from '@darkobits/sleep'
import chalk from 'chalk'
import {
  createConsola,
  LogLevels,
  type LogType
} from 'consola'
import merge from 'deepmerge'
import ora, { type Ora, type Options as OraOptions } from 'ora'
import pQueue from 'p-queue'

import { createChronograph, createScopeMatcher } from 'lib/utils'

import type { EnhancedConsolaOptions, EnhancedConsola } from 'etc/types'

const queue = new pQueue({ concurrency: 1 })

/**
 * @private
 *
 * Target time in milliseconds that it should take to flush the message queue
 * when resuming from being suspended.
 */
const RESUME_ANIMATION_TIME = 500

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

  /**
   * @private
   *
   * Just before resuming a queue of suspended messages, the current size of
   * the queue is captured. This is used to determine a message's relative
   * position in the queue for the purposes of animations. This number should
   * never be set to a value lower than 1.
   */
  let queueSizeAtLastResume = 1
  let hasLoggedEmptyStats = false

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
      // if (!isNode) {
      //   const { text } = oraOptions
      //   enhancedConsola.info(text)
      //   return
      // }

      const oraInstance = ora({ ...oraOptions /** , stream: enhancedConsola. */ })

      const decorateMethods = ['stop', 'succeed', 'fail', 'warn', 'info', 'stopAndPersist'] as const

      // Decorate Ora methods.
      decorateMethods.forEach(methodName => {
        const originalMethod = oraInstance[methodName]

        Reflect.set(oraInstance, methodName, (...args: Parameters<typeof originalMethod>) => {
          // When any method that stops an Ora spinner is called, resume our
          // queue which will start flushing pending messages.
          queueSizeAtLastResume = Math.max(queue.size, 1)
          hasLoggedEmptyStats = false

          const startEmptyTime = Date.now()

          void queue.onEmpty().then(() => {
            const emptyTime = Date.now() - startEmptyTime

            if (!hasLoggedEmptyStats) {
              const { chalk } = enhancedConsola
              enhancedConsola.debug(`Queue emptied in ${chalk.green(`${emptyTime}ms`)}.`)
              hasLoggedEmptyStats = true
            }
          })

          // enhancedConsola.resumeLogs()
          queue.start()

          return Reflect.apply(originalMethod, oraInstance, args)
        })
      })

      // When an Ora spinner is created, pause our queue, which will cause
      // messages to wait.
      // enhancedConsola.pauseLogs()
      queue.pause()
      oraInstance.start()

      return oraInstance
    }
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

  // Asynchronously resolve `debugExpression`.
  const debugExpressionPromise = Promise.resolve(debugExpression ?? env('DEBUG'))

  // Asynchronously create a predicate to match debug scopes against the current
  // debug expression.
  const isAllowedDebugScopePromise = debugExpressionPromise.then(createScopeMatcher)

  // Compute the prefix to prepend to log messages.
  const resolvedHeading = typeof heading === 'function'
    ? heading(enhancedConsola.chalk)
    : heading

  // Decorate log methods.
  Object.keys(LogLevels).forEach(logLevel => {
    const originalMethod = Reflect.get(enhancedConsola, logLevel)
    if (typeof originalMethod !== 'function') return

    Reflect.set(enhancedConsola, logLevel, async (...args: Array<any>) => {
      const [
        isAllowedDebugScope,
        debugExpression
      ] = await Promise.all([
        isAllowedDebugScopePromise,
        debugExpressionPromise,
        logLevelPromise
      ])

      const maskedArgs = args.map(arg => (typeof arg === 'string'
        ? maskString(maskedSecrets, arg)
        : arg))

      if (debugExpression && debugScope && ['debug', 'trace'].includes(logLevel)) {
        if (!isAllowedDebugScope(debugScope ?? '')) return
        maskedArgs.unshift(enhancedConsola.chalk.magenta.bold(debugScope))
      }

      if (resolvedHeading) maskedArgs.unshift(resolvedHeading)

      // Capture the queue size just before adding; this will be our position in
      // the queue.
      const positionInQueue = queue.size

      await queue.add(async () => {
        // We only want to apply a delay to the first N messages, where N is the
        // number of messages that were enqueued when we resumed.
        if (queue.size > 1 && positionInQueue <= queueSizeAtLastResume) {
          await sleep(RESUME_ANIMATION_TIME / queueSizeAtLastResume)
        }

        Reflect.apply(originalMethod, enhancedConsola, maskedArgs)
      })

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