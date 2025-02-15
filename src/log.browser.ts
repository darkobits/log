import merge from 'deepmerge'

import { createCommonLogger } from 'lib/log.common'

import type { EnhancedConsolaOptions, EnhancedBrowserConsola } from 'etc/types'

/**
 * Creates and returns an `EnhancedBrowserConsola` instance.
 */
export function createLogger(options: Partial<EnhancedConsolaOptions> = {}): EnhancedBrowserConsola {
  return createCommonLogger<EnhancedBrowserConsola>(options)
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
export type { EnhancedConsolaOptions, EnhancedBrowserConsola } from 'etc/types'