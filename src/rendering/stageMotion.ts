export interface StageRotation {
  x: number
  y: number
  z: number
}

export function computeIdleSphereRotation(nowMs: number, handWaveBoost = 0): StageRotation {
  const speedMultiplier = 1 + handWaveBoost
  return {
    x: Math.sin(nowMs * 0.00022) * 0.08,
    y: nowMs * 0.00048 * speedMultiplier,
    z: Math.cos(nowMs * 0.00016) * 0.04,
  }
}

export function computeSceneRotation(nowMs: number, scene: string, handWaveBoost = 0): StageRotation {
  if (scene === 'idle') {
    return computeIdleSphereRotation(nowMs, handWaveBoost)
  }

  return {
    x: 0,
    y: Math.sin(nowMs * 0.00018) * 0.18,
    z: 0,
  }
}
