import { LogLevels, type LogType } from 'consola'
import { describe, it, expect, vi, beforeEach } from 'vitest'

import { createLogger, createLoggerFactory } from './log.node'

import type { EnhancedConsola } from './etc/types'

// Helper to create properly typed mock log functions.
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

describe('createLogger (Node)', () => {
  let logger: EnhancedConsola

  beforeEach(() => {
    // Create a fresh logger for each test.
    logger = createLogger()
  })

  it('should create a logger with default options', () => {
    expect(logger).toBeDefined()
    expect(logger.chalk).toBeDefined()
    expect(typeof logger.create).toBe('function')
    expect(typeof logger.chronograph).toBe('function')
    expect(typeof logger.maskSecret).toBe('function')
    expect(typeof logger.spinner).toBe('function')
  })

  it('should support heading function', () => {
    const headingFn = (chalk: any) => chalk.blue('Test')
    const loggerWithHeadingFn = createLogger({ heading: headingFn })
    expect(loggerWithHeadingFn).toBeDefined()
    // Test the heading function is called
    const mockLog = createMockLogFn()
    loggerWithHeadingFn.info = mockLog
    loggerWithHeadingFn.info('test')
    expect(mockLog).toHaveBeenCalled()
  })

  it('should support debug scopes with expressions', async () => {
    const debugLogger = createLogger({
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

  it('should support spinner creation', () => {
    const spinner = logger.spinner({ text: 'Loading...' })
    expect(spinner).toBeDefined()
    expect(typeof spinner.start).toBe('function')
    expect(typeof spinner.stop).toBe('function')
    expect(typeof spinner.succeed).toBe('function')
    expect(typeof spinner.fail).toBe('function')
  })

  it('should handle async initialization with custom log level', async () => {
    const asyncLogger = createLogger({
      level: Promise.resolve('debug' as LogType)
    })

    expect(asyncLogger.isReady()).toBe(false)
    await asyncLogger.onReady()
    expect(asyncLogger.isReady()).toBe(true)
    expect(asyncLogger.level).toBe(LogLevels.debug)
  })
})

describe('createLoggerFactory', () => {
  it('should properly merge nested options', () => {
    const factory = createLoggerFactory({
      heading: 'Default',
      chalkOptions: { level: 1 }
    })
    const logger = factory({
      chalkOptions: { level: 2 }
    })

    // Test chalk options are properly merged
    expect(logger.chalk.level).toBe(2)
  })
})