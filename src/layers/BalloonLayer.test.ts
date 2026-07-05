import { describe, expect, it } from 'vitest'
import { BalloonLayerModel } from './BalloonLayerModel'
import { createCurvedStringPoints } from './BalloonLayer'

describe('BalloonLayerModel', () => {
  it('moves balloons upward and fades them in', () => {
    const layer = new BalloonLayerModel({ count: 8, seed: 4 })
    const before = layer.snapshot()

    layer.update(1.2, 1)
    const after = layer.snapshot()

    expect(after[0].y).toBeGreaterThan(before[0].y)
    expect(after[0].opacity).toBeGreaterThan(before[0].opacity)
  })

  it('keeps colors varied for love scene balloons', () => {
    const layer = new BalloonLayerModel({ count: 24, seed: 6 })
    const colors = new Set(layer.snapshot().map((balloon) => balloon.color))

    expect(colors.size).toBeGreaterThanOrEqual(5)
  })

  it('starts balloons with varied heights and speeds for a less uniform flight', () => {
    const layer = new BalloonLayerModel({ count: 30, seed: 8 })
    const balloons = layer.snapshot()
    const heights = balloons.map((balloon) => balloon.y)
    const speeds = balloons.map((balloon) => balloon.speed)

    expect(Math.max(...heights) - Math.min(...heights)).toBeGreaterThan(4)
    expect(Math.max(...speeds) - Math.min(...speeds)).toBeGreaterThan(0.45)
  })

  it('creates curved string points for visible balloon strings', () => {
    const points = createCurvedStringPoints(0.2, 1.4)

    expect(points).toHaveLength(6)
    expect(points[0].x).toBe(0)
    expect(points.at(-1)?.y).toBeLessThan(points[0].y)
    expect(points.some((point) => Math.abs(point.x) > 0.01)).toBe(true)
  })
})
