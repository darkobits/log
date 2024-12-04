import { ChalkInstance, Options as ChalkOptions } from 'chalk'
import {
  type ConsolaInstance,
  type ConsolaOptions,
  type LogType
} from 'consola'

import type { chronograph } from 'lib/chronograph'
import type { Options as OraOptions, Ora } from 'ora'

/**
 * Options accepted by `createLogger`. Accepts all valid Consola options.
 */
export interface EnhancedConsolaOptions extends Omit<ConsolaOptions, 'level'> {
  /**
   * Optional prefix that will appear before log messages.
   */
  heading?: ((chalk: ChalkInstance, parentHeading?: string ) => string | undefined) | string | undefined
  /**
   * Log level. If this value is a Promise, log messages will be paused
   * until it is resolved.
   *
   * In Node, defaults to the LOG_LEVEL environment variable.
   */
  level: LogType | null | undefined | Promise<LogType | null | undefined>
  /**
   * Value to use for determining what debug scopes should be allowed or denied.
   *
   * In Node, defaults to the DEBUG environment variable.
   *
   * @example 'http:server:connect,-http:server:disconnect,http:logger:*'
   * @see https://github.com/debug-js/debug
   */
  debugExpression?: string | undefined | Promise<string | undefined>
  /**
   * Optional debug scope for this logger. If set, any messages issued at the
   * debug level will only be logged if this scope is allowed according to the
   * value of `debugExpression`.
   *
   * @example 'http:server'
   * @see https://github.com/debug-js/debug
   */
  debugScope?: string | undefined
  /**
   * Options to provide to Chalk.
   */
  chalkOptions?: ChalkOptions
}

/**
 * Common properties and methods for all variants.
 */
export interface EnhancedConsolaCommon extends Omit<ConsolaInstance, 'create'> {
  /**
   * Chalk instance that can be used to style log messages.
   *
   * See: https://github.com/chalk/chalk
   */
  chalk: ChalkInstance
  /**
   * Returns a chronograph that can be used to track time.
   *
   * @example
   *
   * const timer = log.createChronograph()
   * timer.start()
   * // ... SeVeRaL MoMeNtS LaTeR ...
   * log.info(`It has been: ${timer}`) // 'It has been: 4s'
   */
  chronograph: () => ReturnType<typeof chronograph>
  /**
   * Provided a string or regular expression, will redact any matches in
   * subsequent log messages.
   *
   * ⚠️ Note: This only works on string arguments passed to a log method.
   * Objects and other complex values will not be redacted.
   */
  maskSecret: (secret: string | RegExp) => void
  /**
   * Returns `true` if the logger has finished initialization.
   */
  isReady: () => boolean
  /**
   * Returns a `Promise` that resolves when the logger finishes initialization.
   */
  onReady: () => Promise<void>
}

/**
 * The browser version of the logger.
 */
export interface EnhancedBrowserConsola extends EnhancedConsolaCommon {
  /**
   * Creates a "child" logger using the options provided to this logger. The
   * `prefix` option is not inherited. If a `debugScope` is provided, it will be
   * appended to the debug scope of this logger.
   */
  create: (options?: Partial<EnhancedConsolaOptions>) => EnhancedBrowserConsola
}

/**
 * The Node version of the logger.
 */
export interface EnhancedNodeConsola extends EnhancedConsolaCommon {
  /**
   * Creates a "child" logger using the options provided to this logger. The
   * `prefix` option is not inherited. If a `debugScope` is provided, it will be
   * appended to the debug scope of this logger.
   */
  create: (options?: Partial<EnhancedConsolaOptions>) => EnhancedNodeConsola
  /**
   * Pause the logger and create an animated spinner using Ora. Optionally add a
   * message. When the spinner is stopped, any enqueued messages will be flushed
   * and the logger will un-pause.
   */
  spinner: (options: OraOptions) => Ora
}