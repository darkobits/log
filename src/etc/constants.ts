/**
 * True if in a browser environment.
 */
// @ts-expect-error
export const IS_BROWSER = typeof globalThis !== 'undefined' && globalThis.document !== undefined

/**
 * True if in a Node environment.
 */
export const IS_NODE = typeof process !== 'undefined' && process.versions?.node !== null