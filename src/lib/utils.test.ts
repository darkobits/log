import { describe, it, expect } from 'vitest'

import { noOpPredicate, createScopeMatcher } from './utils'

describe('noOpPredicate', () => {
  it('should always return false', () => {
    expect(noOpPredicate()).toBe(false)
  })
})

describe('createScopeMatcher', () => {
  it('should return noOpPredicate for non-string input', () => {
    const matcher = createScopeMatcher()
    expect(matcher('any-scope')).toBe(false)
  })

  it('should return noOpPredicate for empty string', () => {
    const matcher = createScopeMatcher('')
    expect(matcher('any-scope')).toBe(false)
  })

  it('should return noOpPredicate if any segment is empty', () => {
    const matcher = createScopeMatcher('a::b')
    expect(matcher('any-scope')).toBe(false)
  })

  it('should match exact scopes', () => {
    const matcher = createScopeMatcher('http:server')
    expect(matcher('http:server')).toBe(true)
    expect(matcher('http:client')).toBe(false)
  })

  it('should support wildcard patterns', () => {
    const matcher = createScopeMatcher('http:*')
    expect(matcher('http:server')).toBe(true)
    expect(matcher('http:client')).toBe(true)
    expect(matcher('websocket:server')).toBe(false)
  })

  it('should support deny patterns', () => {
    const matcher = createScopeMatcher('http:*,-http:server')
    expect(matcher('http:client')).toBe(true)
    expect(matcher('http:server')).toBe(false)
  })

  it('should support multiple patterns', () => {
    const matcher = createScopeMatcher('http:server,websocket:*,-websocket:client')
    expect(matcher('http:server')).toBe(true)
    expect(matcher('websocket:server')).toBe(true)
    expect(matcher('websocket:client')).toBe(false)
    expect(matcher('tcp:server')).toBe(false)
  })

  it('should handle comma-space separated patterns', () => {
    const matcher = createScopeMatcher('http:server, websocket:server')
    expect(matcher('http:server')).toBe(true)
    expect(matcher('websocket:server')).toBe(true)
    expect(matcher('tcp:server')).toBe(false)
  })
})