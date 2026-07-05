import { describe, expect, it } from 'vitest'
import { getStartMode, shouldAutoAdvance, shouldAutoRequestCamera } from './startMode'

describe('startMode', () => {
  it('waits for gestures by default', () => {
    const mode = getStartMode(new URLSearchParams(''))

    expect(mode).toBe('gesture')
    expect(shouldAutoAdvance(mode)).toBe(false)
    expect(shouldAutoRequestCamera(mode)).toBe(true)
  })

  it('uses auto demo only when explicitly requested', () => {
    const mode = getStartMode(new URLSearchParams('demo=1'))

    expect(mode).toBe('demo')
    expect(shouldAutoAdvance(mode)).toBe(true)
    expect(shouldAutoRequestCamera(mode)).toBe(false)
  })
})
