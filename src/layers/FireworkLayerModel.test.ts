import { describe, expect, it } from 'vitest'
import { FireworkLayerModel } from './FireworkLayerModel'

describe('FireworkLayerModel', () => {
  it('spawns colorful particles that expand from burst centers', () => {
    const model = new FireworkLayerModel({ maxParticles: 360, seed: 12 })

    model.update(0.1, 1)
    const afterSpawn = model.snapshot()

    expect(afterSpawn.length).toBeGreaterThan(80)
    expect(new Set(afterSpawn.map((particle) => particle.color)).size).toBeGreaterThanOrEqual(4)

    const first = afterSpawn[0]
    model.update(0.5, 1)
    const moved = model.snapshot()[0]

    expect(Math.hypot(moved.x - first.x, moved.y - first.y, moved.z - first.z)).toBeGreaterThan(0.12)
  })

  it('fades particles out as they age', () => {
    const model = new FireworkLayerModel({ maxParticles: 180, seed: 2 })

    model.update(0.1, 1)
    const opacity = model.snapshot()[0].opacity

    model.update(1.8, 1)
    const faded = model.snapshot()[0].opacity

    expect(faded).toBeLessThan(opacity)
  })
})
