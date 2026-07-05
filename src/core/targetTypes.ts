export interface TargetBounds {
  minX: number
  maxX: number
  minY: number
  maxY: number
  width: number
  height: number
}

export interface ParticleTarget {
  positions: Float32Array
  colors: Float32Array
  center: { x: number; y: number; z: number }
  bounds: TargetBounds
}

export function computeBounds(positions: Float32Array): {
  center: { x: number; y: number; z: number }
  bounds: TargetBounds
} {
  let minX = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  let sumX = 0
  let sumY = 0
  let sumZ = 0
  const count = positions.length / 3

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]
    const y = positions[i + 1]
    const z = positions[i + 2]
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
    sumX += x
    sumY += y
    sumZ += z
  }

  return {
    center: {
      x: count ? sumX / count : 0,
      y: count ? sumY / count : 0,
      z: count ? sumZ / count : 0,
    },
    bounds: {
      minX,
      maxX,
      minY,
      maxY,
      width: maxX - minX,
      height: maxY - minY,
    },
  }
}
