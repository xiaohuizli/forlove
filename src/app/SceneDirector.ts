import type { GestureSignal } from '../gestures/stableGesture'

export type SceneId = 'idle' | 'count-1' | 'count-2' | 'count-3' | 'love' | 'dissolve' | 'eye'

export interface SceneState {
  scene: SceneId
  enteredAt: number
}

export function createSceneDirector(options: { mode?: 'gesture' | 'auto' } = {}) {
  const mode = options.mode ?? 'gesture'
  let state: SceneState = { scene: 'idle', enteredAt: 0 }

  function enter(scene: SceneId, now: number): SceneState {
    state = { scene, enteredAt: now }
    return state
  }

  return {
    handleGesture(signal: GestureSignal, now: number): SceneState {
      if (signal.gesture === 'fist') {
        return enter('idle', now)
      }

      if (signal.gesture === 'open-palm' || signal.fingerCount >= 5) {
        return enter('idle', now)
      }

      if (signal.gesture === 'count' && signal.fingerCount === 4) {
        return enter('love', now)
      }

      if (signal.gesture === 'count' && signal.fingerCount >= 1 && signal.fingerCount <= 3) {
        return enter(`count-${signal.fingerCount}` as SceneId, now)
      }

      return state
    },

    tick(now: number): SceneState {
      if (mode !== 'auto') {
        return state
      }

      const elapsed = now % 13800
      if (elapsed < 1000) return enter('idle', now)
      if (elapsed < 2200) return enter('count-1', now)
      if (elapsed < 3400) return enter('count-2', now)
      if (elapsed < 4600) return enter('count-3', now)
      if (elapsed < 9000) return enter('love', now)
      return enter('idle', now)
    },

    current(): SceneState {
      return state
    },
  }
}
