import { writeColor } from '../core/color'
import { mulberry32, pick } from '../core/random'
import { computeBounds, type ParticleTarget } from '../core/targetTypes'

export function createCloudTarget(options: {
  count: number
  seed: number
  palette?: string[]
  radius?: number
}): ParticleTarget {
  const random = mulberry32(options.seed)
  const positions = new Float32Array(options.count * 3)
  const colors = new Float32Array(options.count * 3)
  const palette = options.palette ?? ['#f8eaff', '#ffc2f0', '#92f8ff']
  const radius = options.radius ?? 3.2

  for (let i = 0; i < options.count; i += 1) {
    const theta = random() * Math.PI * 2
    const phi = Math.acos(2 * random() - 1)
    const r = radius * Math.cbrt(random())
    const offset = i * 3
    positions[offset] = Math.sin(phi) * Math.cos(theta) * r
    positions[offset + 1] = Math.sin(phi) * Math.sin(theta) * r * 0.7
    positions[offset + 2] = Math.cos(phi) * r
    writeColor(colors, i, pick(palette, random))
  }

  return { positions, colors, ...computeBounds(positions) }
}
