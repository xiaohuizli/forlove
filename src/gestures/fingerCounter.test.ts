import { describe, expect, it } from 'vitest'
import { countExtendedFingers, makeHandLandmarks } from './fingerCounter'
import { classifyHand } from './classifyGesture'

describe('countExtendedFingers', () => {
  it.each([1, 2, 3, 4, 5])('recognizes %i extended fingers', (count) => {
    const landmarks = makeHandLandmarks(count)

    expect(countExtendedFingers(landmarks)).toBe(count)
  })

  it('returns 0 when no landmarks are available', () => {
    expect(countExtendedFingers([])).toBe(0)
  })

  it('classifies four fingers as a count gesture for the main flow', () => {
    expect(classifyHand(makeHandLandmarks(4))).toMatchObject({ fingerCount: 4, gesture: 'count' })
  })

  it('includes the hand center x position for wave-speed control', () => {
    const signal = classifyHand(makeHandLandmarks(1))

    expect(signal.handCenterX).toBeGreaterThan(0.4)
    expect(signal.handCenterX).toBeLessThan(0.7)
  })
})
