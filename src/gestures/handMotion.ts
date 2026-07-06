export function createHandWaveTracker() {
  let lastX: number | undefined
  let lastAt: number | undefined
  let boost = 0

  return {
    update(handCenterX: number | undefined, now: number): number {
      if (handCenterX === undefined) {
        boost *= 0.82
        return boost
      }

      if (lastX === undefined || lastAt === undefined || now <= lastAt) {
        lastX = handCenterX
        lastAt = now
        return boost
      }

      const deltaSeconds = Math.max(0.016, (now - lastAt) / 1000)
      const speed = Math.abs(handCenterX - lastX) / deltaSeconds
      const targetBoost = Math.min(2.4, Math.max(0, (speed - 0.18) * 1.85))
      boost = Math.max(targetBoost, boost * 0.72)
      lastX = handCenterX
      lastAt = now
      return boost
    },
  }
}
