import ms from 'ms'

/**
 * Creates an object that can be used as a chronograph. After being started, it
 * can be placed directly into interpolated strings to print its current value.
 */
export function chronograph() {
  const createdAt = Date.now()

  let state: 'running' | 'paused' = 'running'
  let segmentStartTime = createdAt
  let msAccumulated = 0

  return {
    /** When the chronograph was created as a UNIX timestamp. */
    get createdAt() {
      return createdAt
    },
    /** Whether the chronograph is currently paused or running. */
    get state() {
      return state
    },
    /** Number of milliseconds accumulated by the chronograph. */
    get value() {
      return state === 'paused' ? msAccumulated : Date.now() - segmentStartTime + msAccumulated
    },
    /** Number of milliseconds accumulated by the chronograph. */
    toNumber: () => {
      return state === 'paused' ? msAccumulated : Date.now() - segmentStartTime + msAccumulated
    },
    /** String representation of the chronograph's value. @example '20s' */
    toString: () => {
      return ms(state === 'paused' ? msAccumulated : Date.now() - segmentStartTime + msAccumulated)
    },
    /** String representation of the chronograph's value. @example '20s' */
    toJSON: () => {
      return ms(state === 'paused' ? msAccumulated : Date.now() - segmentStartTime + msAccumulated)
    },
    /** Pauses the chronograph. */
    pause: () => {
      if (state === 'paused') return
      msAccumulated += Date.now() - segmentStartTime
      state = 'paused'
    },
    /** Resumes the chronograph. */
    resume: () => {
      if (state === 'running') return
      segmentStartTime = Date.now()
      state = 'running'
    },
    /** Resets the chronograph's accumulated time to 0. */
    reset: () => {
      msAccumulated = 0
    }
  }
}