import { writeColor } from '../core/color'
import { mulberry32 } from '../core/random'
import { computeBounds, type ParticleTarget } from '../core/targetTypes'

export function createHeartTarget(options: { count: number; seed: number }): ParticleTarget {
  const random = mulberry32(options.seed)
  const positions = new Float32Array(options.count * 3)
  const colors = new Float32Array(options.count * 3)

  for (let i = 0; i < options.count; i += 1) {
    const t = (i / options.count) * Math.PI * 2
    const offset = i * 3
    positions[offset] = (16 * Math.sin(t) ** 3) / 4
    positions[offset + 1] =
      (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) /
        4 -
      0.35
    positions[offset + 2] = (random() - 0.5) * 0.45
    writeColor(colors, i, '#ff165d')
  }

  return { positions, colors, ...computeBounds(positions) }
}
