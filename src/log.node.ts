import env from '@darkobits/env'
import merge from 'deepmerge'

import { createCommonLogger } from 'lib/log.common'

import type { EnhancedConsolaOptions, EnhancedNodeConsola } from 'etc/types'

/**
 * Creates and returns an `EnhancedNodeConsola` instance.
 */
export function createLogger(options: Partial<EnhancedConsolaOptions> = {}): EnhancedNodeConsola {
  return createCommonLogger<EnhancedNodeConsola>(merge({
    // Set the default log level to the LOG_LEVEL environment variable.
    level: env('LOG_LEVEL'),
    // Set the default debug expression to the DEBUG environment variable.
    debugExpression: env('DEBUG')
  }, options))
}

/**
 * Provided a set of default options, returns a version of `createLogger` that
 * will use those defaults.
 */
export function createLoggerFactory(defaultOptions: Partial<EnhancedConsolaOptions> = {}) {
  return (
    options: Partial<EnhancedConsolaOptions> = {}
  ) => createLogger(merge(defaultOptions, options))
}

// Re-export types.
export type { EnhancedConsolaOptions, EnhancedNodeConsola } from 'etc/types'