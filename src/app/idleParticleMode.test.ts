import { describe, expect, it } from 'vitest'
import { idleParticleModeForGesture } from './idleParticleMode'

describe('idleParticleModeForGesture', () => {
  it('spreads the idle sphere on open palm and gathers it on fist', () => {
    expect(idleParticleModeForGesture('idle', { fingerCount: 5, gesture: 'open-palm' })).toBe('spread')
    expect(idleParticleModeForGesture('idle', { fingerCount: 0, gesture: 'fist' })).toBe('sphere')
  })

  it('does not react outside the opening sphere scene', () => {
    expect(idleParticleModeForGesture('count-2', { fingerCount: 5, gesture: 'open-palm' })).toBeNull()
    expect(idleParticleModeForGesture('love', { fingerCount: 0, gesture: 'fist' })).toBeNull()
  })
})
