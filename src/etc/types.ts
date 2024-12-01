import chalk from 'chalk'
import {
  type ConsolaInstance,
  type ConsolaOptions,
  type LogType
} from 'consola'

import { createChronograph } from 'lib/utils'

import type { Options as OraOptions, Ora } from 'ora'

/**
 * Options accepted by `createLogger`. Accepts all valid Consola options.
 */
export interface EnhancedConsolaOptions extends Omit<ConsolaOptions, 'level'> {
  /**
   * Optional prefix that will appear before log messages.
   */
  heading?: string | undefined | ((chalk: chalk.Chalk) => string | undefined)
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
  chalkOptions?: chalk.Options
}

/**
 * Value returned from `createLogger`.
 */
export interface EnhancedConsola extends Omit<ConsolaInstance, 'create'> {
  /**
   * Chalk instance that can be used to style log messages.
   *
   * See: https://github.com/chalk/chalk
   */
  chalk: chalk.Chalk
  /**
   * Creates a "child" logger using the options provided to this logger. The
   * `prefix` option is not inherited. If a `debugScope` is provided, it will be
   * appended to the debug scope of this logger.
   */
  create: (options?: Partial<EnhancedConsolaOptions>) => EnhancedConsola
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
  chronograph: () => ReturnType<typeof createChronograph>

  /**
   * DOCUMENT
   */
  maskSecret: (secret: string) => void

  ora: (options: OraOptions) => Ora
}