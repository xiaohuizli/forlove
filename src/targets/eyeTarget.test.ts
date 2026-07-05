import { describe, expect, it } from 'vitest'
import { createEyeTarget } from './eyeTarget'

describe('createEyeTarget', () => {
  it('creates outer ring, inner ring, and pupil particles with dark gaps', () => {
    const target = createEyeTarget({ count: 6000, seed: 99 })
    const radii = []

    for (let i = 0; i < target.positions.length; i += 3) {
      const x = target.positions[i]
      const y = target.positions[i + 1]
      radii.push(Math.hypot(x / 3.2, y / 1.45))
    }

    const hasPupil = radii.some((radius) => radius < 0.28)
    const hasInnerRing = radii.some((radius) => radius > 0.48 && radius < 0.7)
    const hasOuterRing = radii.some((radius) => radius > 0.88 && radius < 1.12)
    const gapSamples = radii.filter((radius) => radius > 0.72 && radius < 0.84).length

    expect(target.positions).toHaveLength(6000 * 3)
    expect(hasPupil).toBe(true)
    expect(hasInnerRing).toBe(true)
    expect(hasOuterRing).toBe(true)
    expect(gapSamples).toBeLessThan(6000 * 0.08)
  })
})
