import { describe, expect, it } from 'vitest'
import { LOVE_LAYOUT } from './loveLayout'

describe('LOVE_LAYOUT', () => {
  it('keeps the heart centered between I and YOU', () => {
    const leftDistance = LOVE_LAYOUT.heart.x - LOVE_LAYOUT.i.x
    const rightDistance = LOVE_LAYOUT.you.x - LOVE_LAYOUT.heart.x

    expect(leftDistance).toBeGreaterThan(0)
    expect(rightDistance).toBeGreaterThan(0)
    expect(Math.abs(leftDistance - rightDistance)).toBeLessThan(0.001)
  })

  it('leaves enough visual room between the heart and YOU', () => {
    expect(LOVE_LAYOUT.heart.x - LOVE_LAYOUT.i.x).toBeGreaterThan(3.1)
  })
})
