import { describe, expect, it } from 'vitest'
import { createFilledHeartTarget } from './filledHeartTarget'

describe('createFilledHeartTarget', () => {
  it('creates a dense red heart body instead of only an outline', () => {
    const target = createFilledHeartTarget({ count: 1200, seed: 3 })

    expect(target.positions).toHaveLength(3600)
    expect(target.bounds.width).toBeGreaterThan(2.2)
    expect(target.bounds.height).toBeGreaterThan(1.8)
    expect(Math.abs(target.center.x)).toBeLessThan(0.4)
  })
})
