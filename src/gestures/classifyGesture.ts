import { countExtendedFingers, type HandLandmark } from './fingerCounter'
import type { GestureSignal } from './stableGesture'

export function classifyHand(landmarks: HandLandmark[]): GestureSignal {
  const fingerCount = countExtendedFingers(landmarks)

  if (fingerCount >= 5) {
    return { fingerCount, gesture: 'open-palm' }
  }

  if (fingerCount === 0) {
    return { fingerCount, gesture: 'fist' }
  }

  if (fingerCount >= 1 && fingerCount <= 4) {
    return { fingerCount, gesture: 'count' }
  }

  return { fingerCount, gesture: 'none' }
}
