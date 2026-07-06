export interface HandWaveMotion {
  boost: number
  direction: -1 | 0 | 1
}

export function createHandWaveTracker() {
  let lastX: number | undefined
  let lastAt: number | undefined
  let boost = 0

  return {
    update(handCenterX: number | undefined, now: number): HandWaveMotion {
      if (handCenterX === undefined) {
        boost *= 0.82
        return { boost, direction: 0 }
      }

      if (lastX === undefined || lastAt === undefined || now <= lastAt) {
        lastX = handCenterX
        lastAt = now
        return { boost, direction: 0 }
      }

      const delta = handCenterX - lastX
      const direction: -1 | 0 | 1 = Math.abs(delta) < 0.015 ? 0 : delta < 0 ? -1 : 1
      const deltaSeconds = Math.max(0.016, (now - lastAt) / 1000)
      const speed = Math.abs(delta) / deltaSeconds
      const targetBoost = Math.min(2.4, Math.max(0, (speed - 0.18) * 1.85))
      boost = Math.max(targetBoost, boost * 0.72)
      lastX = handCenterX
      lastAt = now
      return { boost, direction }
    },
  }
}
