import { describe, expect, it } from 'vitest'
import { createTextTarget } from './textTarget'

describe('createTextTarget', () => {
  it('generates centered, non-empty points for I love you text', () => {
    const target = createTextTarget({
      text: 'I ❤ YOU',
      count: 4000,
      width: 900,
      height: 320,
      seed: 12,
      color: '#f7eaff',
    })

    expect(target.positions).toHaveLength(4000 * 3)
    expect(target.colors).toHaveLength(4000 * 3)
    expect(target.bounds.width).toBeGreaterThan(5)
    expect(target.bounds.height).toBeGreaterThan(1.5)
    expect(Math.abs(target.center.x)).toBeLessThan(0.2)
    expect(Math.abs(target.center.y)).toBeLessThan(0.2)
  })

  it('generates deterministic positions for a numeric target', () => {
    const first = createTextTarget({ text: '3', count: 200, width: 360, height: 360, seed: 7 })
    const second = createTextTarget({ text: '3', count: 200, width: 360, height: 360, seed: 7 })

    expect(Array.from(first.positions)).toEqual(Array.from(second.positions))
  })
})
