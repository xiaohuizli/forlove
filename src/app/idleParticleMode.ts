import type { SceneId } from './SceneDirector'
import type { GestureSignal } from '../gestures/stableGesture'

export type IdleParticleMode = 'sphere' | 'spread'

export function idleParticleModeForGesture(scene: SceneId, gesture: GestureSignal): IdleParticleMode | null {
  if (scene !== 'idle') {
    return null
  }

  if (gesture.gesture === 'open-palm' || gesture.fingerCount >= 5) {
    return 'spread'
  }

  if (gesture.gesture === 'fist') {
    return 'sphere'
  }

  return null
}
