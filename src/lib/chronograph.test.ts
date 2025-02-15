import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

import { chronograph } from './chronograph'

describe('chronograph', () => {
  let now = 1000

  beforeEach(() => {
    vi.spyOn(Date, 'now').mockImplementation(() => now)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should initialize with correct state', () => {
    const timer = chronograph()
    expect(timer.state).toBe('running')
    expect(timer.createdAt).toBe(1000)
    expect(timer.value).toBe(0)
  })

  it('should track elapsed time', () => {
    const timer = chronograph()
    now += 5000
    expect(timer.value).toBe(5000)
    expect(timer.toString()).toBe('5s')
  })

  it('should pause and resume tracking', () => {
    const timer = chronograph()
    now += 2000
    timer.pause()
    expect(timer.state).toBe('paused')
    expect(timer.value).toBe(2000)
    now += 1000
    expect(timer.value).toBe(2000)
    timer.resume()
    expect(timer.state).toBe('running')
    now += 3000
    expect(timer.value).toBe(5000)
  })

  it('should handle multiple pause/resume cycles', () => {
    const timer = chronograph()
    now += 1000
    timer.pause()
    now += 500
    timer.resume()
    now += 2000
    timer.pause()
    expect(timer.value).toBe(3000)
  })

  it('should reset accumulated time', () => {
    const timer = chronograph()
    now += 2000
    timer.pause()
    timer.reset()
    expect(timer.value).toBe(0)
    timer.resume()
    now += 1000
    expect(timer.value).toBe(1000)
  })

  it('should handle repeated pause/resume calls gracefully', () => {
    const timer = chronograph()
    timer.pause()
    timer.pause()
    expect(timer.state).toBe('paused')
    timer.resume()
    timer.resume()
    expect(timer.state).toBe('running')
  })

  it('should provide consistent values across different output methods', () => {
    const timer = chronograph()
    now += 1000
    expect(timer.value).toBe(1000)
    expect(timer.toNumber()).toBe(1000)
    expect(timer.toString()).toBe('1s')
    expect(timer.toJSON()).toBe('1s')
  })

  it('should format different time ranges correctly', () => {
    const timer = chronograph()
    now += 500
    expect(timer.toString()).toBe('500ms')
    now += 1500
    expect(timer.toString()).toBe('2s')
    now += 58_000
    expect(timer.toString()).toBe('1m')
  })
})