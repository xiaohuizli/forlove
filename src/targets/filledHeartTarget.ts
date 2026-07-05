import { writeColor } from '../core/color'
import { mulberry32 } from '../core/random'
import { computeBounds, type ParticleTarget } from '../core/targetTypes'

export function createFilledHeartTarget(options: { count: number; seed: number }): ParticleTarget {
  const random = mulberry32(options.seed)
  const positions = new Float32Array(options.count * 3)
  const colors = new Float32Array(options.count * 3)

  for (let i = 0; i < options.count; i += 1) {
    let x = 0
    let y = 0
    for (let attempt = 0; attempt < 80; attempt += 1) {
      x = random() * 2.8 - 1.4
      y = random() * 2.5 - 1.15
      const equation = (x * x + y * y - 1) ** 3 - x * x * y ** 3
      if (equation <= 0) break
    }
    const offset = i * 3

    positions[offset] = x * 1.35
    positions[offset + 1] = y * 1.35
    positions[offset + 2] = (random() - 0.5) * 0.35
    writeColor(colors, i, '#ff165d')
  }

  return { positions, colors, ...computeBounds(positions) }
}
