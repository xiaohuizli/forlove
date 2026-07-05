import { writeColor } from '../core/color'
import { mulberry32, pick } from '../core/random'
import { computeBounds, type ParticleTarget } from '../core/targetTypes'

export function createSphereTarget(options: {
  count: number
  seed: number
  radius?: number
  shellJitter?: number
  palette?: string[]
}): ParticleTarget {
  const random = mulberry32(options.seed)
  const positions = new Float32Array(options.count * 3)
  const colors = new Float32Array(options.count * 3)
  const radius = options.radius ?? 2.7
  const shellJitter = options.shellJitter ?? 0.12
  const palette = options.palette ?? ['#f7eaff', '#e3b2ff', '#a6f7ff', '#ff8bd9']

  for (let i = 0; i < options.count; i += 1) {
    const theta = random() * Math.PI * 2
    const z = random() * 2 - 1
    const ring = Math.sqrt(Math.max(0, 1 - z * z))
    const jitteredRadius = radius + (random() - 0.5) * shellJitter * 2
    const offset = i * 3

    positions[offset] = Math.cos(theta) * ring * jitteredRadius
    positions[offset + 1] = Math.sin(theta) * ring * jitteredRadius
    positions[offset + 2] = z * jitteredRadius
    writeColor(colors, i, pick(palette, random))
  }

  return { positions, colors, ...computeBounds(positions) }
}
