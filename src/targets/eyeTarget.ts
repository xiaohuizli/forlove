import { writeColor } from '../core/color'
import { mulberry32 } from '../core/random'
import { computeBounds, type ParticleTarget } from '../core/targetTypes'

export function createEyeTarget(options: { count: number; seed: number }): ParticleTarget {
  const random = mulberry32(options.seed)
  const positions = new Float32Array(options.count * 3)
  const colors = new Float32Array(options.count * 3)

  for (let i = 0; i < options.count; i += 1) {
    const band = i / options.count
    const angle = random() * Math.PI * 2
    const offset = i * 3
    let radius: number
    let color = '#ffeaff'

    if (band < 0.2) {
      radius = Math.sqrt(random()) * 0.27
      color = '#ffffff'
    } else if (band < 0.5) {
      radius = 0.5 + random() * 0.18
      color = random() > 0.5 ? '#ff8fcf' : '#9bf8ff'
    } else {
      radius = 0.9 + random() * 0.2
      color = random() > 0.5 ? '#f8eaff' : '#ff6cc7'
    }

    positions[offset] = Math.cos(angle) * radius * 3.2
    positions[offset + 1] = Math.sin(angle) * radius * 1.45
    positions[offset + 2] = (random() - 0.5) * 0.35
    writeColor(colors, i, color)
  }

  return { positions, colors, ...computeBounds(positions) }
}
