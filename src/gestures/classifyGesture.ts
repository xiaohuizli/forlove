import { countExtendedFingers, type HandLandmark } from './fingerCounter'
import type { GestureSignal } from './stableGesture'

export function classifyHand(landmarks: HandLandmark[]): GestureSignal {
  const fingerCount = countExtendedFingers(landmarks)
  const handCenterX = computeHandCenterX(landmarks)

  if (fingerCount >= 5) {
    return { fingerCount, gesture: 'open-palm', handCenterX }
  }

  if (fingerCount === 0) {
    return { fingerCount, gesture: 'fist', handCenterX }
  }

  if (fingerCount >= 1 && fingerCount <= 4) {
    return { fingerCount, gesture: 'count', handCenterX }
  }

  return { fingerCount, gesture: 'none', handCenterX }
}

function computeHandCenterX(landmarks: HandLandmark[]): number | undefined {
  if (landmarks.length === 0) return undefined
  return landmarks.reduce((sum, landmark) => sum + landmark.x, 0) / landmarks.length
}
