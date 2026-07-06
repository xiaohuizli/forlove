import { describe, expect, it } from 'vitest'
import { computeIdleSphereRotation } from './stageMotion'

describe('computeIdleSphereRotation', () => {
  it('keeps rotating forward over time instead of rocking in place', () => {
    const a = computeIdleSphereRotation(0)
    const b = computeIdleSphereRotation(1000)
    const c = computeIdleSphereRotation(2000)

    expect(b.y).toBeGreaterThan(a.y)
    expect(c.y).toBeGreaterThan(b.y)
    expect(c.y - a.y).toBeLessThan(0.28)
  })

  it('rotates the idle earth slowly by default but follows hand wave direction', () => {
    const start = computeIdleSphereRotation(0, 0)
    const later = computeIdleSphereRotation(1000, 0)
    const left = computeIdleSphereRotation(1000, 2, -1)
    const right = computeIdleSphereRotation(1000, 2, 1)

    expect(Math.abs(later.y - start.y)).toBeLessThan(0.18)
    expect(left.y).toBeLessThan(start.y)
    expect(right.y).toBeGreaterThan(start.y)
    expect(Math.abs(right.y - start.y)).toBeGreaterThan(Math.abs(later.y - start.y))
  })
})
