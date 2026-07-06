export interface StageRotation {
  x: number
  y: number
  z: number
}

export type RotationDirection = -1 | 0 | 1

export function computeIdleSphereRotation(
  nowMs: number,
  handWaveBoost = 0,
  handWaveDirection: RotationDirection = 0,
): StageRotation {
  const baseSpeed = 0.00011
  const directedSpeed = 0.00018 + handWaveBoost * 0.00018
  const y = handWaveDirection === 0 ? nowMs * baseSpeed : nowMs * directedSpeed * handWaveDirection

  return {
    x: Math.sin(nowMs * 0.00022) * 0.08,
    y,
    z: Math.cos(nowMs * 0.00016) * 0.04,
  }
}

export function computeSceneRotation(
  nowMs: number,
  scene: string,
  handWaveBoost = 0,
  handWaveDirection: RotationDirection = 0,
): StageRotation {
  if (scene === 'idle') {
    return computeIdleSphereRotation(nowMs, handWaveBoost, handWaveDirection)
  }

  return {
    x: 0,
    y: Math.sin(nowMs * 0.00018) * 0.18,
    z: 0,
  }
}
