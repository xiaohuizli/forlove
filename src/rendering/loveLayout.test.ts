import { describe, expect, it } from 'vitest'
import { LOVE_LAYOUT } from './loveLayout'

describe('LOVE_LAYOUT', () => {
  it('keeps two-character visual spacing around the heart', () => {
    const visualHalfWidth = {
      i: 0.45,
      heart: 0.95,
      you: 1.45,
    }
    const iRightEdge = LOVE_LAYOUT.i.x + visualHalfWidth.i
    const heartLeftEdge = LOVE_LAYOUT.heart.x - visualHalfWidth.heart
    const heartRightEdge = LOVE_LAYOUT.heart.x + visualHalfWidth.heart
    const yLeftEdge = LOVE_LAYOUT.you.x - visualHalfWidth.you
    const leftGap = heartLeftEdge - iRightEdge
    const rightGap = yLeftEdge - heartRightEdge

    expect(leftGap).toBeGreaterThan(1)
    expect(leftGap).toBeLessThan(1.35)
    expect(rightGap).toBeGreaterThan(1)
    expect(rightGap).toBeLessThan(1.35)
    expect(Math.abs(leftGap - rightGap)).toBeLessThan(0.2)
  })
})
