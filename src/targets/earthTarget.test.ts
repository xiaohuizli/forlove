import { describe, expect, it } from 'vitest'
import { createEarthTarget } from './earthTarget'

function uniqueColorCount(colors: Float32Array): number {
  const unique = new Set<string>()
  for (let i = 0; i < colors.length; i += 3) {
    unique.add(`${colors[i].toFixed(3)},${colors[i + 1].toFixed(3)},${colors[i + 2].toFixed(3)}`)
  }
  return unique.size
}

function oceanBlueRatio(colors: Float32Array): number {
  let ocean = 0
  const total = colors.length / 3
  for (let i = 0; i < colors.length; i += 3) {
    const r = colors[i]
    const g = colors[i + 1]
    const b = colors[i + 2]
    if (b > 0.52 && g > 0.18 && r < 0.12) ocean += 1
  }
  return ocean / total
}

function cloudWhiteRatio(colors: Float32Array): number {
  let cloud = 0
  const total = colors.length / 3
  for (let i = 0; i < colors.length; i += 3) {
    const r = colors[i]
    const g = colors[i + 1]
    const b = colors[i + 2]
    if (r > 0.78 && g > 0.78 && b > 0.78) cloud += 1
  }
  return cloud / total
}

function cityLightRatio(colors: Float32Array): number {
  let city = 0
  const total = colors.length / 3
  for (let i = 0; i < colors.length; i += 3) {
    const r = colors[i]
    const g = colors[i + 1]
    const b = colors[i + 2]
    if (r > 0.86 && g > 0.58 && g < 0.92 && b < 0.46) city += 1
  }
  return city / total
}

function isLandAccent(colors: Float32Array, index: number): boolean {
  const offset = index * 3
  const key = `${colors[offset].toFixed(3)},${colors[offset + 1].toFixed(3)},${colors[offset + 2].toFixed(3)}`
  return new Set([
    '0.173,0.949,0.612',
    '0.000,0.784,0.325',
    '0.224,0.827,0.325',
    '0.498,0.827,0.231',
    '0.086,0.639,0.290',
    '0.710,0.651,0.259',
    '0.839,0.714,0.298',
  ]).has(key)
}

function projectedRegionBins(target: ReturnType<typeof createEarthTarget>): Array<{ accentRatio: number; total: number }> {
  const gridSize = 6
  const bins = Array.from({ length: gridSize * gridSize }, () => ({ accent: 0, total: 0 }))

  for (let i = 0; i < target.positions.length; i += 3) {
    const x = target.positions[i]
    const y = target.positions[i + 1]
    const normalizedX = Math.max(-0.999, Math.min(0.999, x / target.bounds.maxX))
    const normalizedY = Math.max(-0.999, Math.min(0.999, y / target.bounds.maxY))
    const column = Math.floor(((normalizedX + 1) / 2) * gridSize)
    const row = Math.floor(((normalizedY + 1) / 2) * gridSize)
    const bin = row * gridSize + column
    bins[bin].total += 1
    if (isLandAccent(target.colors, i / 3)) bins[bin].accent += 1
  }

  return bins.filter((bin) => bin.total > 80).map((bin) => ({ accentRatio: bin.accent / bin.total, total: bin.total }))
}

function average(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length
}

describe('createEarthTarget', () => {
  it('creates a bounded particle globe', () => {
    const target = createEarthTarget({ count: 2000, seed: 42, radius: 2.7 })

    expect(target.positions).toHaveLength(6000)
    expect(target.colors).toHaveLength(6000)
    expect(target.bounds.width).toBeGreaterThan(4.8)
    expect(target.bounds.width).toBeLessThan(5.8)
    expect(target.bounds.height).toBeGreaterThan(4.8)
    expect(target.bounds.height).toBeLessThan(5.8)
  })

  it('uses blue oceans with green continents and white cloud highlights', () => {
    const target = createEarthTarget({ count: 3000, seed: 7, radius: 2.7 })

    expect(uniqueColorCount(target.colors)).toBeGreaterThanOrEqual(9)
    expect(oceanBlueRatio(target.colors)).toBeGreaterThan(0.3)
    expect(cloudWhiteRatio(target.colors)).toBeGreaterThan(0.02)
    expect(cloudWhiteRatio(target.colors)).toBeLessThan(0.12)
  })

  it('creates visible continent and ocean regions instead of evenly speckled color', () => {
    const target = createEarthTarget({ count: 6000, seed: 9, radius: 2.7 })
    const ratios = projectedRegionBins(target).map((bin) => bin.accentRatio)
    const maxRatio = Math.max(...ratios)
    const minRatio = Math.min(...ratios)

    expect(maxRatio - minRatio).toBeGreaterThan(0.28)
    expect(ratios.filter((ratio) => ratio > 0.36).length).toBeGreaterThanOrEqual(3)
    expect(ratios.filter((ratio) => ratio < 0.16).length).toBeGreaterThanOrEqual(3)
  })

  it('makes continent regions denser than ocean regions', () => {
    const target = createEarthTarget({ count: 9000, seed: 11, radius: 2.7 })
    const bins = projectedRegionBins(target)
    const continentBins = bins.filter((bin) => bin.accentRatio > 0.36)
    const oceanBins = bins.filter((bin) => bin.accentRatio < 0.16)

    expect(continentBins.length).toBeGreaterThanOrEqual(3)
    expect(oceanBins.length).toBeGreaterThanOrEqual(3)
    expect(average(continentBins.map((bin) => bin.total))).toBeGreaterThan(average(oceanBins.map((bin) => bin.total)) * 1.42)
  })

  it('adds restrained warm city lights around land without overwhelming the ocean', () => {
    const target = createEarthTarget({ count: 9000, seed: 17, radius: 2.7 })
    const ratio = cityLightRatio(target.colors)

    expect(ratio).toBeGreaterThan(0.018)
    expect(ratio).toBeLessThan(0.09)
  })
})
