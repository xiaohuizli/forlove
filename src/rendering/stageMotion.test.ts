import { describe, expect, it } from 'vitest'
import { computeIdleSphereRotation } from './stageMotion'

describe('computeIdleSphereRotation', () => {
  it('keeps rotating forward over time instead of rocking in place', () => {
    const a = computeIdleSphereRotation(0)
    const b = computeIdleSphereRotation(1000)
    const c = computeIdleSphereRotation(2000)

    expect(b.y).toBeGreaterThan(a.y)
    expect(c.y).toBeGreaterThan(b.y)
    expect(c.y - a.y).toBeGreaterThan(0.7)
  })
})
