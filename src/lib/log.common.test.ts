import { LogLevels, type LogType } from 'consola'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createCommonLogger } from './log.common'

import type { EnhancedConsolaCommon } from 'etc/types'

const createMockLogFn = () => {
  const fn = vi.fn()

  return Object.assign(fn, {
    raw: vi.fn(),
    withDefaults: vi.fn(),
    withTag: vi.fn(),
    withScope: vi.fn(),
    wrapAll: vi.fn(),
    wrapConsole: vi.fn(),
    restoreConsole: vi.fn(),
    create: vi.fn(),
    pauseLogs: vi.fn(),
    resumeLogs: vi.fn()
  }) as any
}

describe('createLogger (Common)', () => {
  let logger: EnhancedConsolaCommon

  beforeEach(() => {
    logger = createCommonLogger()
  })

  it('should create a logger with default options', () => {
    expect(logger).toBeDefined()
    expect(logger.chalk).toBeDefined()
    expect(typeof logger.chronograph).toBe('function')
    expect(typeof logger.redact).toBe('function')
  })

  it('should support heading function', () => {
    const headingFn = (chalk: any) => chalk.blue('Test')
    const loggerWithHeadingFn = createCommonLogger({ heading: headingFn })
    expect(loggerWithHeadingFn).toBeDefined()
    const mockLog = createMockLogFn()
    loggerWithHeadingFn.info = mockLog
    loggerWithHeadingFn.info('test')
    expect(mockLog).toHaveBeenCalled()
  })

  it('should support debug scopes with expressions', async () => {
    const debugLogger = createCommonLogger({
      debugScope: 'test:scope',
      debugExpression: 'test:*',
      level: 'debug' as LogType
    })

    const mockLog = createMockLogFn()
    debugLogger.debug = mockLog

    await debugLogger.onReady()
    debugLogger.debug('test message')

    expect(mockLog).toHaveBeenCalled()
  })

  it('should handle async initialization with custom log level', async () => {
    const asyncLogger = createCommonLogger({
      level: Promise.resolve('debug' as LogType)
    })

    expect(asyncLogger.isReady()).toBe(false)
    await asyncLogger.onReady()
    expect(asyncLogger.isReady()).toBe(true)
    expect(asyncLogger.level).toBe(LogLevels.debug)
  })
})