import type { GestureSignal } from '../gestures/stableGesture'

export type SceneId = 'idle' | 'count-1' | 'count-2' | 'count-3' | 'love' | 'dissolve' | 'eye'

export interface SceneState {
  scene: SceneId
  enteredAt: number
}

export function createSceneDirector(options: { mode?: 'gesture' | 'auto' } = {}) {
  const mode = options.mode ?? 'gesture'
  let state: SceneState = { scene: 'idle', enteredAt: 0 }
  let progress = 0

  function enter(scene: SceneId, now: number): SceneState {
    state = { scene, enteredAt: now }
    return state
  }

  function advanceTo(nextProgress: number, scene: SceneId, now: number): SceneState {
    if (nextProgress !== progress + 1) {
      return state
    }

    progress = nextProgress
    return enter(scene, now)
  }

  function reset(now: number): SceneState {
    progress = 0
    return enter('idle', now)
  }

  return {
    handleGesture(signal: GestureSignal, now: number): SceneState {
      if (signal.gesture === 'fist' || signal.gesture === 'open-palm' || signal.fingerCount >= 5) {
        return progress >= 4 ? reset(now) : state
      }

      if (signal.gesture === 'count') {
        if (signal.fingerCount === 1) return advanceTo(1, 'count-1', now)
        if (signal.fingerCount === 2) return advanceTo(2, 'count-2', now)
        if (signal.fingerCount === 3) return advanceTo(3, 'count-3', now)
        if (signal.fingerCount === 4) return advanceTo(4, 'love', now)
      }

      return state
    },

    tick(now: number): SceneState {
      if (mode !== 'auto') {
        return state
      }

      const elapsed = now % 13800
      if (elapsed < 1000) {
        progress = 0
        return enter('idle', now)
      }
      if (elapsed < 2200) {
        progress = 1
        return enter('count-1', now)
      }
      if (elapsed < 3400) {
        progress = 2
        return enter('count-2', now)
      }
      if (elapsed < 4600) {
        progress = 3
        return enter('count-3', now)
      }
      if (elapsed < 9000) {
        progress = 4
        return enter('love', now)
      }
      progress = 0
      return enter('idle', now)
    },

    current(): SceneState {
      return state
    },
  }
}
