export interface HandLandmark {
  x: number
  y: number
  z: number
}

const FINGER_TIPS = [8, 12, 16, 20]
const FINGER_PIPS = [6, 10, 14, 18]

export function countExtendedFingers(landmarks: HandLandmark[]): number {
  if (landmarks.length < 21) {
    return 0
  }

  const fingers = FINGER_TIPS.reduce((count, tip, index) => {
    return count + (landmarks[tip].y < landmarks[FINGER_PIPS[index]].y ? 1 : 0)
  }, 0)
  const thumbExtended = Math.abs(landmarks[4].x - landmarks[2].x) > 0.11

  return fingers + (thumbExtended ? 1 : 0)
}

export function makeHandLandmarks(extendedCount: number): HandLandmark[] {
  const landmarks = Array.from({ length: 21 }, () => ({ x: 0.5, y: 0.62, z: 0 }))
  const extendedFingers = Math.min(extendedCount, 4)

  landmarks[0] = { x: 0.5, y: 0.82, z: 0 }
  landmarks[2] = { x: 0.35, y: 0.62, z: 0 }
  landmarks[4] = { x: extendedCount === 5 ? 0.18 : 0.4, y: 0.58, z: 0 }

  FINGER_TIPS.forEach((tip, index) => {
    const pip = FINGER_PIPS[index]
    const x = 0.42 + index * 0.07
    landmarks[pip] = { x, y: 0.48, z: 0 }
    landmarks[tip] = { x, y: index < extendedFingers ? 0.22 : 0.68, z: 0 }
  })

  return landmarks
}
