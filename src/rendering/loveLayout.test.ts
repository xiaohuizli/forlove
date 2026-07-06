import { describe, expect, it } from 'vitest'
import { LOVE_LAYOUT } from './loveLayout'

describe('LOVE_LAYOUT', () => {
  it('keeps the heart visually centered between I and the Y edge', () => {
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

    expect(leftGap).toBeGreaterThan(0)
    expect(rightGap).toBeGreaterThan(0)
    expect(Math.abs(leftGap - rightGap)).toBeLessThan(0.001)
  })

  it('leaves enough visual room between the heart and YOU', () => {
    expect(LOVE_LAYOUT.you.x - LOVE_LAYOUT.heart.x).toBeGreaterThan(4.5)
  })
})
