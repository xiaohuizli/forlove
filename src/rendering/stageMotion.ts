export interface StageRotation {
  x: number
  y: number
  z: number
}

export function computeIdleSphereRotation(nowMs: number): StageRotation {
  return {
    x: Math.sin(nowMs * 0.00022) * 0.08,
    y: nowMs * 0.00048,
    z: Math.cos(nowMs * 0.00016) * 0.04,
  }
}

export function computeSceneRotation(nowMs: number, scene: string): StageRotation {
  if (scene === 'idle') {
    return computeIdleSphereRotation(nowMs)
  }

  return {
    x: 0,
    y: Math.sin(nowMs * 0.00018) * 0.18,
    z: 0,
  }
}
