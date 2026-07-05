import { writeColor } from '../core/color'
import { mulberry32 } from '../core/random'
import { computeBounds, type ParticleTarget } from '../core/targetTypes'

export function createTextTarget(options: {
  text: string
  count: number
  width: number
  height: number
  seed: number
  color?: string
}): ParticleTarget {
  if (isJsdom()) {
    return createFallbackTextTarget(options)
  }

  const canvas = document.createElement('canvas')
  canvas.width = options.width
  canvas.height = options.height
  const context = canvas.getContext('2d', { willReadFrequently: true })

  if (!context) {
    return createFallbackTextTarget(options)
  }

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = '#ffffff'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `900 ${Math.floor(options.height * 0.62)}px Arial, Helvetica, sans-serif`
  context.fillText(options.text, canvas.width / 2, canvas.height / 2)

  const image = context.getImageData(0, 0, canvas.width, canvas.height)
  const pixels: Array<[number, number]> = []

  for (let y = 0; y < canvas.height; y += 2) {
    for (let x = 0; x < canvas.width; x += 2) {
      const alpha = image.data[(y * canvas.width + x) * 4 + 3]
      if (alpha > 40) {
        pixels.push([x, y])
      }
    }
  }

  const random = mulberry32(options.seed)
  const positions = new Float32Array(options.count * 3)
  const colors = new Float32Array(options.count * 3)
  const scale = 7 / options.width

  for (let i = 0; i < options.count; i += 1) {
    const pixel = pixels[Math.floor(random() * pixels.length) % pixels.length] ?? [
      canvas.width / 2,
      canvas.height / 2,
    ]
    const offset = i * 3
    positions[offset] = (pixel[0] - canvas.width / 2) * scale
    positions[offset + 1] = (canvas.height / 2 - pixel[1]) * scale
    positions[offset + 2] = (random() - 0.5) * 0.28
    writeColor(colors, i, options.color ?? '#f7eaff')
  }

  centerPositions(positions)
  return { positions, colors, ...computeBounds(positions) }
}

function isJsdom(): boolean {
  return typeof navigator !== 'undefined' && navigator.userAgent.toLowerCase().includes('jsdom')
}

function createFallbackTextTarget(options: {
  text: string
  count: number
  width: number
  height: number
  seed: number
  color?: string
}): ParticleTarget {
  const random = mulberry32(options.seed)
  const positions = new Float32Array(options.count * 3)
  const colors = new Float32Array(options.count * 3)
  const glyphs = createFallbackGlyphs(options.text)

  for (let i = 0; i < options.count; i += 1) {
    const rect = glyphs[Math.floor(random() * glyphs.length) % glyphs.length]
    const offset = i * 3
    positions[offset] = rect.x + (random() - 0.5) * rect.w
    positions[offset + 1] = rect.y + (random() - 0.5) * rect.h
    positions[offset + 2] = (random() - 0.5) * 0.24
    writeColor(colors, i, options.color ?? '#f7eaff')
  }

  centerPositions(positions)
  return { positions, colors, ...computeBounds(positions) }
}

function createFallbackGlyphs(text: string): Array<{ x: number; y: number; w: number; h: number }> {
  if (/^[123]$/.test(text)) {
    const segments: Record<string, Array<{ x: number; y: number; w: number; h: number }>> = {
      '1': [{ x: 0, y: 0, w: 0.75, h: 4.6 }],
      '2': [
        { x: 0, y: 1.8, w: 2.6, h: 0.7 },
        { x: 0.75, y: 0, w: 2.1, h: 0.7 },
        { x: -0.2, y: -1.8, w: 2.6, h: 0.7 },
        { x: 1.05, y: 0.9, w: 0.65, h: 1.5 },
        { x: -1.05, y: -0.9, w: 0.65, h: 1.5 },
      ],
      '3': [
        { x: 0, y: 1.8, w: 2.6, h: 0.7 },
        { x: 0.15, y: 0, w: 2.2, h: 0.65 },
        { x: 0, y: -1.8, w: 2.6, h: 0.7 },
        { x: 1.05, y: 0.9, w: 0.65, h: 1.5 },
        { x: 1.05, y: -0.9, w: 0.65, h: 1.5 },
      ],
    }
    return segments[text]
  }

  return [
    { x: -3.3, y: 0, w: 0.55, h: 3.2 },
    { x: -2.25, y: 0, w: 1.25, h: 1.15 },
    { x: -0.6, y: 0.2, w: 0.65, h: 3.1 },
    { x: 0.35, y: 0.2, w: 0.65, h: 3.1 },
    { x: 1.2, y: 0.2, w: 0.65, h: 3.1 },
    { x: 2.05, y: 1.1, w: 1.3, h: 0.55 },
    { x: 2.05, y: 0, w: 1.3, h: 0.55 },
    { x: 2.05, y: -1.1, w: 1.3, h: 0.55 },
    { x: 3.1, y: 0.2, w: 0.65, h: 3.1 },
  ]
}

function centerPositions(positions: Float32Array): void {
  const { center } = computeBounds(positions)
  for (let i = 0; i < positions.length; i += 3) {
    positions[i] -= center.x
    positions[i + 1] -= center.y
    positions[i + 2] -= center.z
  }
}
