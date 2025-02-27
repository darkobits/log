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
export interface EnhancedConsolaCommon<T = void> extends Omit<ConsolaInstance, 'create'> {
  /**
   * Chalk instance that can be used to style log messages.
   *
   * See: https://github.com/chalk/chalk
   */
  chalk: ChalkInstance
  /**
   * Returns a chronograph that can be used to track time. Use it as an
   * interpolated value in a template string literal and it will render its
   * current value in a human-friendly format.
   *
   * @example
   *
   * const timer = log.chronograph()
   *
   * // ... SeVeRaL HoUrS LaTeR ...
   *
   * log.info(`It has been: ${timer}`) // 'It has been: 4h'
   */
  chronograph: () => ReturnType<typeof chronograph>
  /**
   * Create a new logger that inherits the configuration of the this logger.
   */
  create: (options: Partial<EnhancedConsolaOptions>) => T extends void ? EnhancedConsolaCommon : T
  /**
   * Provided a string or regular expression, will redact any matching patterns
   * in subsequent string arguments provided to log methods.
   *
   * ⚠️ Note: For performance reasons, this only operates on string arguments
   * passed to a log method. Objects and other complex values will not be
   * redacted.
   */
  redact: (pattern: string | RegExp) => void
  /**
   * Returns `true` if the logger has finished initialization.
   */
  isReady: () => boolean
  /**
   * Returns a `Promise` that resolves when the logger has finished
   * initialization.
   */
  onReady: () => Promise<void>
}

/**
 * The browser version of the logger.
 */
export type EnhancedBrowserConsola = EnhancedConsolaCommon<EnhancedBrowserConsola>

/**
 * The Node version of the logger.
 */
export interface EnhancedNodeConsola extends EnhancedConsolaCommon<EnhancedNodeConsola> {
  /**
   * Pause the logger and create an animated spinner using Ora. Optionally add a
   * message. When the spinner is stopped, any enqueued messages will be flushed
   * and the logger will un-pause.
   */
  spinner: (options: OraOptions) => Ora
}