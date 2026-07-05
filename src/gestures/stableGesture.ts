export type GestureKind = 'count' | 'open-palm' | 'fist' | 'none'

export interface GestureSignal {
  fingerCount: number
  gesture: GestureKind
}

export interface StableGestureOptions {
  stableMs: number
  cooldownMs: number
}

export function createStableGesture(options: StableGestureOptions) {
  let candidate: GestureSignal | null = null
  let candidateSince = 0
  let lastEmitAt = Number.NEGATIVE_INFINITY

  return {
    update(signal: GestureSignal, now: number): GestureSignal | null {
      const same =
        candidate?.fingerCount === signal.fingerCount && candidate?.gesture === signal.gesture

      if (!same) {
        candidate = signal
        candidateSince = now
        return null
      }

      if (now - lastEmitAt < options.cooldownMs) {
        return null
      }

      if (now - candidateSince >= options.stableMs) {
        lastEmitAt = now
        return signal
      }

      return null
    },
  }
}
