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

  it('rotates faster when hand-wave boost is present', () => {
    const normal = computeIdleSphereRotation(1000, 0)
    const boosted = computeIdleSphereRotation(1000, 1.5)

    expect(boosted.y).toBeGreaterThan(normal.y * 2)
  })
})
