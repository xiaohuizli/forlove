import { writeColor } from '../core/color'
import { mulberry32, pick } from '../core/random'
import { computeBounds, type ParticleTarget } from '../core/targetTypes'

const OCEAN_BLUES = ['#001f78', '#0030a8', '#0040d8', '#0058f0', '#06328f', '#006a9c']
const LAND_ACCENTS = ['#00c853', '#39d353', '#7fd33b', '#16a34a', '#b5a642', '#d6b64c']
const CLOUDS = ['#ffffff', '#dbefff', '#fff4c8']
const VISIBLE_CONTINENTS = [
  { x: -0.62, y: 0.33, rx: 0.36, ry: 0.3 },
  { x: -0.45, y: -0.32, rx: 0.24, ry: 0.42 },
  { x: 0.05, y: 0.16, rx: 0.3, ry: 0.24 },
  { x: 0.18, y: -0.26, rx: 0.26, ry: 0.42 },
  { x: 0.48, y: 0.28, rx: 0.44, ry: 0.32 },
  { x: 0.64, y: -0.08, rx: 0.34, ry: 0.28 },
  { x: 0.5, y: -0.58, rx: 0.24, ry: 0.16 },
]

export function createEarthTarget(options: {
  count: number
  seed: number
  radius?: number
  shellJitter?: number
}): ParticleTarget {
  const random = mulberry32(options.seed)
  const positions = new Float32Array(options.count * 3)
  const colors = new Float32Array(options.count * 3)
  const radius = options.radius ?? 2.7
  const shellJitter = options.shellJitter ?? 0.1

  for (let i = 0; i < options.count; i += 1) {
    const sample = sampleEarthPoint({ random, radius, shellJitter })
    const offset = i * 3

    positions[offset] = sample.x
    positions[offset + 1] = sample.y
    positions[offset + 2] = sample.z

    if (sample.cloudBand || sample.polarGlow) {
      writeColor(colors, i, pick(CLOUDS, random))
    } else if (sample.isLand) {
      writeColor(colors, i, pick(sample.nearCoast && random() > 0.6 ? [...LAND_ACCENTS, '#fff1a8'] : LAND_ACCENTS, random))
    } else {
      writeColor(colors, i, pick(OCEAN_BLUES, random))
    }
  }

  return { positions, colors, ...computeBounds(positions) }
}

function sampleEarthPoint(options: {
  random: () => number
  radius: number
  shellJitter: number
}): {
  x: number
  y: number
  z: number
  isLand: boolean
  nearCoast: boolean
  cloudBand: boolean
  polarGlow: boolean
} {
  for (let attempt = 0; attempt < 120; attempt += 1) {
    const sample = createEarthPointCandidate(options)
    const density = sample.isLand ? 1 : sample.nearCoast ? 0.66 : 0.48
    if (options.random() < density) return sample
  }

  return createEarthPointCandidate(options)
}

function createEarthPointCandidate(options: {
  random: () => number
  radius: number
  shellJitter: number
}): {
  x: number
  y: number
  z: number
  isLand: boolean
  nearCoast: boolean
  cloudBand: boolean
  polarGlow: boolean
} {
  const theta = options.random() * Math.PI * 2
  const unitZ = options.random() * 2 - 1
  const ring = Math.sqrt(Math.max(0, 1 - unitZ * unitZ))
  const jitteredRadius = options.radius + (options.random() - 0.5) * options.shellJitter * 2
  const x = Math.cos(theta) * ring * jitteredRadius
  const y = Math.sin(theta) * ring * jitteredRadius
  const z = unitZ * jitteredRadius
  const visibleX = x / options.radius
  const visibleY = y / options.radius
  const latitude = Math.asin(unitZ)
  const landScore = VISIBLE_CONTINENTS.reduce((score, continent) => {
    const lonDistance = (visibleX - continent.x) / continent.rx
    const latDistance = (visibleY - continent.y) / continent.ry
    return Math.max(score, 1 - lonDistance * lonDistance - latDistance * latDistance)
  }, -Infinity)
  const coastlineNoise =
    Math.sin(theta * 9.3 + latitude * 5.1) * 0.12 +
    Math.cos(visibleX * 12.2 - visibleY * 8.7) * 0.1
  const landValue = landScore + coastlineNoise
  const isLand = landValue > -0.12
  const nearCoast = Math.abs(landValue + 0.12) < 0.08
    const cloudBand = Math.abs(Math.sin(latitude * 8 + theta * 1.7)) < 0.045 && options.random() > 0.9
    const polarGlow = Math.abs(unitZ) > 0.84 && options.random() > 0.82

  return { x, y, z, isLand, nearCoast, cloudBand, polarGlow }
}
