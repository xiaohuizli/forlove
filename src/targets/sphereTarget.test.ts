import { describe, expect, it } from 'vitest'
import { createSphereTarget } from './sphereTarget'

describe('createSphereTarget', () => {
  it('places particles on a rotating-sphere shell shape', () => {
    const target = createSphereTarget({ count: 240, seed: 10, radius: 2.6, shellJitter: 0.08 })
    const radii: number[] = []

    for (let i = 0; i < target.positions.length; i += 3) {
      radii.push(Math.hypot(target.positions[i], target.positions[i + 1], target.positions[i + 2]))
    }

    const min = Math.min(...radii)
    const max = Math.max(...radii)
    const average = radii.reduce((sum, value) => sum + value, 0) / radii.length

    expect(target.positions).toHaveLength(720)
    expect(min).toBeGreaterThan(2.35)
    expect(max).toBeLessThan(2.85)
    expect(average).toBeGreaterThan(2.52)
    expect(average).toBeLessThan(2.68)
    expect(target.bounds.width).toBeGreaterThan(4.8)
  })
})
