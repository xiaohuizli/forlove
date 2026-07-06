import { describe, expect, it } from 'vitest'
import { createHandWaveTracker } from './handMotion'

describe('createHandWaveTracker', () => {
  it('increases rotation boost when the hand moves quickly side to side', () => {
    const tracker = createHandWaveTracker()

    expect(tracker.update(0.45, 0).boost).toBe(0)
    const slow = tracker.update(0.47, 250)
    const fast = tracker.update(0.76, 500)

    expect(slow.boost).toBeLessThan(0.35)
    expect(fast.boost).toBeGreaterThan(0.8)
  })

  it('decays boost when hand movement stops', () => {
    const tracker = createHandWaveTracker()

    tracker.update(0.2, 0)
    const fast = tracker.update(0.8, 200)
    const settled = tracker.update(0.8, 900)

    expect(fast.boost).toBeGreaterThan(settled.boost)
  })

  it('reports wave direction from hand center movement', () => {
    const tracker = createHandWaveTracker()

    expect(tracker.update(0.6, 0)).toMatchObject({ direction: 0 })
    expect(tracker.update(0.35, 100)).toMatchObject({ direction: -1 })
    expect(tracker.update(0.72, 220)).toMatchObject({ direction: 1 })
  })
})
