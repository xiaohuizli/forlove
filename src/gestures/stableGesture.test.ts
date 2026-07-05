import { describe, expect, it } from 'vitest'
import { createStableGesture } from './stableGesture'

describe('stable gesture', () => {
  it('emits only after the same finger count is stable long enough', () => {
    const stable = createStableGesture({ stableMs: 350, cooldownMs: 700 })

    expect(stable.update({ fingerCount: 1, gesture: 'count' }, 0)).toBeNull()
    expect(stable.update({ fingerCount: 1, gesture: 'count' }, 200)).toBeNull()
    expect(stable.update({ fingerCount: 1, gesture: 'count' }, 360)).toEqual({
      fingerCount: 1,
      gesture: 'count',
    })
  })

  it('respects cooldown after an emission', () => {
    const stable = createStableGesture({ stableMs: 100, cooldownMs: 700 })

    expect(stable.update({ fingerCount: 2, gesture: 'count' }, 0)).toBeNull()
    expect(stable.update({ fingerCount: 2, gesture: 'count' }, 120)).not.toBeNull()
    expect(stable.update({ fingerCount: 3, gesture: 'count' }, 300)).toBeNull()
    expect(stable.update({ fingerCount: 3, gesture: 'count' }, 900)).not.toBeNull()
  })
})
