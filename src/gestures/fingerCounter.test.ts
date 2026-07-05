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
    expect(classifyHand(makeHandLandmarks(4))).toEqual({ fingerCount: 4, gesture: 'count' })
  })
})
